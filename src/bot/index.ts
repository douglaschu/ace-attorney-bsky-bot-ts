import { renderThread } from "./renderer.js";
import { AtpAgent } from "@atproto/api";
import { promises as fs } from "fs";
import * as dotenv from "dotenv";
import {
     getCursor,
     setCursor,
     hasProcessed,
     markProcessed,
     getRenderByReplyUri,
} from "./database.js";
import { getThread } from "./bluesky.js";

dotenv.config();

// Create a Bluesky Agent
const agent = new AtpAgent({
     service: "https://bsky.social",
});

async function main() {
     await agent.login({
          identifier: process.env.BLUESKY_USERNAME!,
          password: process.env.BLUESKY_APP_PASSWORD!,
     });

     const cursor = getCursor();
     console.log(`Starting from cursor: ${cursor ?? "beginning"}`);

     const { data } = await agent.listNotifications();

     const mentions = data.notifications.filter(
          (n) =>
               n.reason === "mention" &&
               !n.isRead &&
               (cursor === null || n.indexedAt > cursor),
     );

     console.log(`Found ${mentions.length} unread mentions(s)`);

     for (const m of mentions) {
          if (hasProcessed(m.uri)) {
               console.log(`Skipping already processed: ${m.uri}`);
               continue;
          }
          const mentionText = (m.record as { text: string }).text.toLowerCase();
          const trimmedText = mentionText.replace(/@\S+/g, "").trim();

          if (trimmedText === "delete") {
               const deleteRecord = m.record as {
                    reply?: { parent: { uri: string; cid: string } };
               };
               const parentUri = deleteRecord.reply?.parent?.uri;
               if (!parentUri) {
                    markProcessed(m.uri, "", "");
                    continue;
               }
               const render = getRenderByReplyUri(parentUri);
               if (!render || render.requester_did !== m.author.did) {
                    markProcessed(m.uri, "", "");
                    continue;
               }
               await agent.deletePost(render.reply_uri);
               markProcessed(m.uri, "", "");
               console.log(`Deleted render for ${m.author.handle}`);
               continue;
          }

          if (!mentionText.includes("render")) {
               continue;
          }

          const thread = await getThread(
               agent,
               m.uri,
               process.env.BLUESKY_USERNAME!,
          );
          const videoPath = await renderThread(thread);
          console.log(`Rendered video: ${videoPath}`);
          console.log(`Thread has ${thread.length} post(s)`);
          console.log(thread);

          // Extract the root info from the reply property of the mention's records and store it in a variable.
          const mentionRecord = m.record as {
               reply?: { root: { uri: string; cid: string } };
          };
          const threadRoot = mentionRecord.reply?.root ?? {
               uri: m.uri,
               cid: m.cid,
          };

          const videoBytes = await fs.readFile(videoPath);
          const session = agent.session!;
          const serviceAuthRes = await agent.com.atproto.server.getServiceAuth({
               aud: `did:web:${new URL(agent.dispatchUrl).host}`,
               lxm: "com.atproto.repo.uploadBlob",
          });
          const videoToken = serviceAuthRes.data.token;
          const videoServiceUrl = "https://video.bsky.app";
          const uploadUrl = new URL(
               `${videoServiceUrl}/xrpc/app.bsky.video.uploadVideo`,
          );
          uploadUrl.searchParams.append("did", session.did);
          uploadUrl.searchParams.append("name", "output.mp4");
          const uploadRes = await fetch(uploadUrl, {
               method: "POST",
               headers: {
                    Authorization: `Bearer ${videoToken}`,
                    "Content-Type": "video/mp4",
               },
               body: videoBytes,
          });
          const uploadJson = await uploadRes.json();
          console.log("Upload response:", JSON.stringify(uploadJson));
          const { jobId } = uploadJson as { jobId: string };
          let videoBlob: unknown;
          const videoAgent = new AtpAgent({ service: videoServiceUrl });
          while (!videoBlob) {
               const { data: status } =
                    await videoAgent.app.bsky.video.getJobStatus({ jobId });
               console.log("Status:", status.jobStatus.state);
               if (status.jobStatus.blob) {
                    videoBlob = status.jobStatus.blob;
               }
               await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const postResult = await agent.post({
               text: "⚖️ All rise! Court is now in session.",
               reply: {
                    root: threadRoot,
                    parent: { uri: m.uri, cid: m.cid },
               },
               embed: {
                    $type: "app.bsky.embed.video",
                    video: videoBlob,
               },
          });
          console.log(`Replied to ${m.author.handle}`);

          markProcessed(m.uri, postResult.uri, m.author.did);
     }

     if (data.notifications.length > 0) {
          const latest = data.notifications[0];
          if (latest) {
               setCursor(latest.indexedAt);
          }
     }

     await agent.updateSeenNotifications();
}

main();

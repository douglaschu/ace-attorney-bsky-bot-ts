import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import {
     getCursor,
     setCursor,
     hasProcessed,
     markProcessed,
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

          const thread = await getThread(agent, m.uri);
          console.log(`Thread has ${thread.length} post(s)`);
          console.log(thread);

          await agent.post({
               text: "Order! Order in the court!",
               reply: {
                    root: { uri: m.uri, cid: m.cid },
                    parent: { uri: m.uri, cid: m.cid },
               },
          });
          console.log(`Replied to ${m.author.handle}`);

          markProcessed(m.uri);
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

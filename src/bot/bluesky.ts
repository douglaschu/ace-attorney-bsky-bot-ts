import type { AtpAgent } from "@atproto/api";
import { AppBskyFeedDefs } from "@atproto/api";

export interface ThreadPost {
     handle: string;
     displayName: string;
     text: string;
     did: string;
     imageUrl: string | null;
}

export const getThread = async (
     agent: AtpAgent,
     uri: string,
     botHandle: string,
): Promise<ThreadPost[]> => {
     const { data } = await agent.getPostThread({
          uri,
          depth: 0,
          parentHeight: 100,
     });
     let node: typeof data.thread | null = data.thread;
     const posts: ThreadPost[] = [];
     while (AppBskyFeedDefs.isThreadViewPost(node)) {
          const record = node.post.record as { text: string };
          const embed = node.post.embed as {
               $type?: string;
               images?: { fullsize: string }[];
          } | null;
          const imageUrl =
               embed?.$type === "app.bsky.embed.images#view" &&
               embed.images?.[0]?.fullsize
                    ? embed.images[0].fullsize
                    : (embed as any)?.$type ===
                             "app.bsky.embed.recordWithMedia#view" &&
                        (embed as any).media?.images?.[0]?.fullsize
                      ? (embed as any).media.images[0].fullsize
                      : null;
          const rawText = record.text.trim();
          let text = rawText;
          if (text === "") {
               if (embed?.$type === "app.bsky.embed.video#view") {
                    text = "(video)";
               } else {
                    text = "...";
               }
          }
          if (
               !text.includes(`@${botHandle}`) &&
               !(
                    node.post.author.did === agent.session?.did &&
                    text.includes("All rise! Court is now in session")
               )
          ) {
               posts.unshift({
                    handle: node.post.author.handle,
                    displayName:
                         node.post.author.displayName ||
                         node.post.author.handle,
                    text: text,
                    did: node.post.author.did,
                    imageUrl,
               });
          }

          // extract quoted post from embed
          const embedAny = embed as any;
          let quotedRecord: any = null;
          if (embedAny?.$type === "app.bsky.embed.record#view") {
               quotedRecord = embedAny.record;
          } else if (
               embedAny?.$type === "app.bsky.embed.recordWithMedia#view"
          ) {
               quotedRecord = embedAny.record?.record;
          }
          if (
               quotedRecord?.$type === "app.bsky.embed.record#viewRecord" &&
               !(quotedRecord.value?.text ?? "").includes(`@${botHandle}`) &&
               quotedRecord.author?.did !== agent.session?.did
          ) {
               const quotedText =
                    ((quotedRecord.value?.text as string) ?? "").trim() ||
                    "...";
               const quotedEmbeds = quotedRecord.embeds as
                    | { $type?: string; images?: { fullsize: string }[] }[]
                    | undefined;
               const quotedImageUrl =
                    quotedEmbeds?.[0]?.$type === "app.bsky.embed.images#view" &&
                    quotedEmbeds[0].images?.[0]?.fullsize
                         ? quotedEmbeds[0].images[0].fullsize
                         : null;
               posts.unshift({
                    handle: quotedRecord.author.handle,
                    displayName:
                         quotedRecord.author.displayName ||
                         quotedRecord.author.handle,
                    text: quotedText,
                    did: quotedRecord.author.did,
                    imageUrl: quotedImageUrl,
               });
          }

          node = node.parent ?? null;
     }
     return posts;
};

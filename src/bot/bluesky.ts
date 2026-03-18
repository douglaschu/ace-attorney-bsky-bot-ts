import type { AtpAgent } from "@atproto/api";
import { AppBskyFeedDefs } from "@atproto/api";

export interface ThreadPost {
     handle: string;
     text: string;
     did: string;
}

export const getThread = async (
     agent: AtpAgent,
     uri: string,
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
          posts.unshift({
               handle: node.post.author.handle,
               text: record.text,
               did: node.post.author.did,
          });
          node = node.parent ?? null;
     }
     return posts;
};

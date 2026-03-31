import { AtpAgent } from "@atproto/api";
import { getThread } from "./bluesky.js";
import * as dotenv from "dotenv";
dotenv.config();

const agent = new AtpAgent({ service: "https://bsky.social" });
await agent.login({
     identifier: process.env.BLUESKY_USERNAME!,
     password: process.env.BLUESKY_APP_PASSWORD!,
});

const toAtUri = (input: string): string => {
     const match = input.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/);
     if (match) return `at://${match[1]}/app.bsky.feed.post/${match[2]}`;
     return input;
};

const TEST_URI = toAtUri(
     "https://bsky.app/profile/brotheryassini.bsky.social/post/3mi36fbhev22o",
);

const TEST_URI_2 = toAtUri(
     "https://bsky.app/profile/condottishuji.bsky.social/post/3mi34sxvu4s2o",
);

const thread = await getThread(agent, TEST_URI, process.env.BLUESKY_USERNAME!);
console.log(JSON.stringify(thread, null, 2));
console.log(`\nTotal posts: ${thread.length}`);

const thread2 = await getThread(
     agent,
     TEST_URI_2,
     process.env.BLUESKY_USERNAME!,
);
console.log(JSON.stringify(thread2, null, 2));
console.log(`\nTotal posts: ${thread2.length}`);

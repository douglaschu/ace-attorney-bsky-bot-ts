import { spawn } from "child_process";
import type { ThreadPost } from "./bluesky.js";

export const renderThread = async (thread: ThreadPost[]): Promise<string> => {
     const json = JSON.stringify(thread);
     const py = spawn("python3", ["render_bridge/render_bridge.py"]);
     py.stdin.write(json);
     py.stdin.end();
     return new Promise((resolve, reject) => {
          let output = "";
          py.stdout.on("data", (chunk) => {
               output += chunk.toString();
          });
          py.stderr.on("data", (chunk) => {
               process.stderr.write(chunk);
          });
          py.on("close", (code) => {
               if (code === 0) {
                    resolve(output.trim().split("\n").at(-1)!);
               } else {
                    reject(new Error(`Render failed with exit code ${code}`));
               }
          });
     });
};

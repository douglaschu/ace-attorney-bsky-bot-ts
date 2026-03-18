import { z } from "zod";

const schema = z.object({
     BLUESKY_USERNAME: z.string().min(1),
     BLUESKY_APP_PASSWORD: z.string().min(1),
});

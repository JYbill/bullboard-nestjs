import type { z } from "zod";
import type { bullmqConfigItemSchema } from "./bullmq.config.js";

/** BullMQ 队列配置项。 */
export type BullmqConfigItem = z.infer<typeof bullmqConfigItemSchema>;

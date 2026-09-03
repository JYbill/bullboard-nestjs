import type { z } from "zod";
import type { envConfigSchema } from "./config.validate.js";

/** 已校验并完成运行期转换的应用配置。 */
export type EnvConfig = z.infer<typeof envConfigSchema>;

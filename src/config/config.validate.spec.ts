import { describe, expect, it, vi } from "vitest";
import { envConfigSchema } from "./config.validate.js";
import type { BullmqConfigItem } from "./bullmq.config.d.js";

vi.mock("./bullmq.config.js", () => ({
  loadBullmqConfig: vi.fn<() => BullmqConfigItem[]>(() => []),
}));

describe("envConfigSchema", () => {
  // 目的：验证字符串形式的环境变量端口会转换为应用实际使用的数字。
  // 总结：PORT 保持显式数字转换，避免 ConfigService 返回字符串。
  it("coerces PORT to a number", () => {
    const config = envConfigSchema.parse({
      PORT: "3000",
      BULL_BOARD_USERNAME: "admin",
      BULL_BOARD_PASSWORD_HASH: "password-hash",
    });

    // 期待：字符串端口经过 Schema 后成为数字 3000。
    expect(config.PORT).toBe(3000);
  });

  // 目的：验证认证所需的环境变量缺失时启动配置校验失败。
  // 总结：BULL_BOARD_PASSWORD_HASH 是必填配置，不能静默跳过。
  it("rejects missing required environment variables", () => {
    // 期待：缺少密码哈希时抛出的校验错误明确指向对应字段。
    expect(() =>
      envConfigSchema.parse({
        PORT: "3000",
        BULL_BOARD_USERNAME: "admin",
      }),
    ).toThrow("BULL_BOARD_PASSWORD_HASH");
  });
});

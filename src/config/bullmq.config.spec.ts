import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadBullmqConfig } from "./bullmq.config.js";
import { BULLMQ_REDIS_CONNECT_TIMEOUT_MS } from "@/enum/app.enum.js";
import {
  TEST_BULLMQ_BULL_PREFIX,
  TEST_BULLMQ_QUEUE_NAME,
  TEST_REDIS_DB,
  TEST_REDIS_HOST,
  TEST_REDIS_PORT,
} from "@/enum/test.enum.js";
import type { BullmqConfigItem } from "./bullmq.config.d.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const completeConfigItem = {
  host: TEST_REDIS_HOST,
  port: TEST_REDIS_PORT,
  password: "redis-password",
  username: "",
  ca: "",
  clientCert: "",
  clientKey: "",
  dbNum: TEST_REDIS_DB,
  bullPrefix: TEST_BULLMQ_BULL_PREFIX,
  timeout: BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
  prefix: "app#",
  queues: [TEST_BULLMQ_QUEUE_NAME],
} satisfies BullmqConfigItem;

const invalidConfigCases: Array<[string, JsonValue]> = [
  ["host 不是字符串", [{ ...completeConfigItem, host: 127001 }]],
  ["port 不是数字", [{ ...completeConfigItem, port: "6379" }]],
  ["password 不是字符串", [{ ...completeConfigItem, password: 123456 }]],
  ["username 不是字符串", [{ ...completeConfigItem, username: 123456 }]],
  ["ca 不是字符串", [{ ...completeConfigItem, ca: 123456 }]],
  ["clientCert 不是字符串", [{ ...completeConfigItem, clientCert: 123456 }]],
  ["clientKey 不是字符串", [{ ...completeConfigItem, clientKey: 123456 }]],
  ["dbNum 不是数字", [{ ...completeConfigItem, dbNum: "0" }]],
  ["bullPrefix 不是字符串", [{ ...completeConfigItem, bullPrefix: 123456 }]],
  ["timeout 不是数字", [{ ...completeConfigItem, timeout: "5000" }]],
  ["prefix 不是字符串", [{ ...completeConfigItem, prefix: 123456 }]],
  ["queues 不是数组", [{ ...completeConfigItem, queues: TEST_BULLMQ_QUEUE_NAME }]],
  ["queues 包含非字符串项", [{ ...completeConfigItem, queues: [TEST_BULLMQ_QUEUE_NAME, 123456] }]],
];

describe("loadBullmqConfig", () => {
  let appRoot: string;

  beforeEach(() => {
    appRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bullmq-config-"));
    fs.mkdirSync(path.join(appRoot, "env"));
  });

  afterEach(() => {
    fs.rmSync(appRoot, { recursive: true, force: true });
  });

  /** 写入测试用 BullMQ 配置文件。 */
  const writeBullmqConfig = (config: JsonValue): void => {
    fs.writeFileSync(path.join(appRoot, "env/bullmq.config.json"), JSON.stringify(config));
  };

  // 目的：验证 TLS 客户端证书只配置一侧时会抛出明确错误。
  // 总结：clientCert 和 clientKey 必须成对填写或同时留空。
  it.each([
    ["clientCert", { ...completeConfigItem, clientCert: "./client.cer" }],
    ["clientKey", { ...completeConfigItem, clientKey: "./client.key" }],
  ] satisfies Array<[string, BullmqConfigItem]>)(
    "rejects incomplete client TLS config when only %s is set",
    (_caseName, config) => {
      writeBullmqConfig([config]);

      // 期待：加载配置时抛出提示 clientCert 和 clientKey 必须成对填写的错误。
      expect(() => loadBullmqConfig(appRoot)).toThrow("clientCert 和 clientKey 必须同时填写或同时留空");
    },
  );

  // 目的：验证配置字段类型不符合声明时会被校验拦截。
  // 总结：BullMQ 配置加载会拒绝非法字段类型并给出校验失败错误。
  it.each(invalidConfigCases)("rejects invalid config when %s", (_caseName, config) => {
    writeBullmqConfig(config);

    // 期待：字段类型不合法时统一抛出校验失败错误。
    expect(() => loadBullmqConfig(appRoot)).toThrow("校验失败");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadBullmqConfig } from "./bullmq.config.js";
import {
  TEST_BULLMQ_BULL_PREFIX,
  TEST_BULLMQ_QUEUE_NAME,
  TEST_REDIS_DB,
  TEST_REDIS_HOST,
  TEST_REDIS_PORT,
} from "@/enum/test.enum.js";
import { type BullmqConfigItem } from "@type/config.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const completeConfigItem = {
  host: TEST_REDIS_HOST,
  port: TEST_REDIS_PORT,
  password: "redis-password",
  dbNum: TEST_REDIS_DB,
  bullPrefix: TEST_BULLMQ_BULL_PREFIX,
  prefix: "app-",
  queues: [TEST_BULLMQ_QUEUE_NAME],
} satisfies BullmqConfigItem;

const configItemWithoutPrefix = {
  host: TEST_REDIS_HOST,
  port: TEST_REDIS_PORT,
  password: "",
  dbNum: TEST_REDIS_DB,
  bullPrefix: TEST_BULLMQ_BULL_PREFIX,
  queues: [TEST_BULLMQ_QUEUE_NAME],
} satisfies BullmqConfigItem;

const invalidConfigCases: Array<[string, JsonValue]> = [
  ["host 不是字符串", [{ ...completeConfigItem, host: 127001 }]],
  ["port 不是数字", [{ ...completeConfigItem, port: "6379" }]],
  ["password 不是字符串", [{ ...completeConfigItem, password: 123456 }]],
  ["dbNum 不是数字", [{ ...completeConfigItem, dbNum: "0" }]],
  ["bullPrefix 不是字符串", [{ ...completeConfigItem, bullPrefix: 123456 }]],
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

  const writeBullmqConfig = (config: JsonValue) => {
    fs.writeFileSync(path.join(appRoot, "env/bullmq.config.json"), JSON.stringify(config));
  };

  it("loads a complete valid config matching the template", () => {
    writeBullmqConfig([completeConfigItem]);

    expect(loadBullmqConfig(appRoot)).toEqual([completeConfigItem]);
  });

  it("allows empty password and omitted optional prefix", () => {
    writeBullmqConfig([configItemWithoutPrefix]);

    expect(loadBullmqConfig(appRoot)).toEqual([configItemWithoutPrefix]);
  });

  it("allows empty queues for Redis auto discovery", () => {
    const configItemWithEmptyQueues = { ...completeConfigItem, queues: [] } satisfies BullmqConfigItem;
    writeBullmqConfig([configItemWithEmptyQueues]);

    expect(loadBullmqConfig(appRoot)).toEqual([configItemWithEmptyQueues]);
  });

  it.each(invalidConfigCases)("rejects invalid config when %s", (_caseName, config) => {
    writeBullmqConfig(config);

    expect(() => loadBullmqConfig(appRoot)).toThrow("校验失败");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadBullmqConfig } from "./bullmq.config.js";
import { type BullmqConfigItem } from "@type/config.js";

const REDIS_PORT = 6379;
const REDIS_DB = 0;
const BULLMQ_CONFIG_RELATIVE_PATH = "env/bullmq.config.json";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const completeConfigItem = {
  host: "127.0.0.1",
  port: REDIS_PORT,
  password: "redis-password",
  dbNum: REDIS_DB,
  bullPrefix: "bull",
  prefix: "app-",
  queues: ["example-queue"],
} satisfies BullmqConfigItem;

const configItemWithoutPrefix = {
  host: "127.0.0.1",
  port: REDIS_PORT,
  password: "",
  dbNum: REDIS_DB,
  bullPrefix: "bull",
  queues: ["example-queue"],
} satisfies BullmqConfigItem;

const invalidConfigCases: Array<[string, JsonValue]> = [
  ["host 不是字符串", [{ ...completeConfigItem, host: 127001 }]],
  ["port 不是数字", [{ ...completeConfigItem, port: "6379" }]],
  ["password 不是字符串", [{ ...completeConfigItem, password: 123456 }]],
  ["dbNum 不是数字", [{ ...completeConfigItem, dbNum: "0" }]],
  ["bullPrefix 不是字符串", [{ ...completeConfigItem, bullPrefix: 123456 }]],
  ["prefix 不是字符串", [{ ...completeConfigItem, prefix: 123456 }]],
  ["queues 不是数组", [{ ...completeConfigItem, queues: "example-queue" }]],
  ["queues 是空数组", [{ ...completeConfigItem, queues: [] }]],
  ["queues 包含非字符串项", [{ ...completeConfigItem, queues: ["example-queue", 123456] }]],
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
    fs.writeFileSync(path.join(appRoot, BULLMQ_CONFIG_RELATIVE_PATH), JSON.stringify(config));
  };

  it("loads a complete valid config matching the template", () => {
    writeBullmqConfig([completeConfigItem]);

    expect(loadBullmqConfig(appRoot)).toEqual([completeConfigItem]);
  });

  it("allows empty password and omitted optional prefix", () => {
    writeBullmqConfig([configItemWithoutPrefix]);

    expect(loadBullmqConfig(appRoot)).toEqual([configItemWithoutPrefix]);
  });

  it.each(invalidConfigCases)("rejects invalid config when %s", (_caseName, config) => {
    writeBullmqConfig(config);

    expect(() => loadBullmqConfig(appRoot)).toThrow("校验失败");
  });
});

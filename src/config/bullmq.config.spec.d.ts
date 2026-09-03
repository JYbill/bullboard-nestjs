/** 单元测试写入临时配置文件时允许使用的 JSON 值。 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

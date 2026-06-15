export default {
  // 对应 Prettier 的 singleQuote。
  // false 表示字符串优先使用双引号；如果原项目是 singleQuote: true，就改成 true。
  singleQuote: false,

  // 对应 Prettier 的 trailingComma。
  // "all" 表示多行对象、数组、参数等位置尽量保留尾逗号，迁移时应按原项目取值设置。
  trailingComma: "all",

  // 对应 Prettier 的 printWidth。
  // 显式设置项目原来的最大行宽，避免迁移后因为工具默认值不同产生额外换行 diff。
  printWidth: 120,
};

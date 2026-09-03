# package.json 模板

`name` 是占位值，落地到项目时必须替换成目标项目自己的包名。不要复制来源项目的业务包名、技能同步脚本、commitlint 配置或业务专用依赖。

```json
{
  "name": "<replace-with-project-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "pnpm typecheck && vite build",
    "preview": "vite preview",
    "typecheck": "tsgo --noEmit",
    "lint": "oxlint --deny-warnings --config oxlint.config.ts",
    "format": "oxfmt --config oxfmt.config.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "husky"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.1",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@typescript/native-preview": "7.0.0-dev.20260624.1",
    "@vitejs/plugin-react": "^6.0.2",
    "husky": "^9.1.7",
    "jsdom": "^26.1.0",
    "lint-staged": "^17.0.8",
    "oxfmt": "^0.56.0",
    "oxlint": "^1.71.0",
    "oxlint-tsgolint": "^0.23.0",
    "tailwindcss": "^4.3.1",
    "vite": "^8.1.0",
    "vitest": "^4.0.18"
  },
  "engines": {
    "node": ">=24"
  }
}
```

export default {
  "*.ts": ["oxfmt --write", "oxlint --config oxlint.config.ts --fix --no-error-on-unmatched-pattern"],
};

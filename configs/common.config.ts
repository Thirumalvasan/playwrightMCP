export const commonConfig = {
  timeout: 120_000,
  headless: true,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
};
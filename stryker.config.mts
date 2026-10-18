export const target = {
  name: "recording:resampler-mapping",
  testFiles: ["test/cases/recording/unit/meetingResamplerMapping.test.ts"],
  artifactDirectory: "reports/mutation/recording/resampler-mapping",
  timeoutMs: { "dry-run": 300_000, full: 1_200_000 },
};

export default {
  packageManager: "pnpm",
  testRunner: "command",
  commandRunner: { command: `pnpm test -- ${target.testFiles.join(" ")}` },
  coverageAnalysis: "off",
  // tsx transpiles the focused tests without type checking.
  disableTypeChecks: false,
  mutate: ["src/helpers/meetingResamplerMapping.ts"],
  concurrency: 1,
  dryRunTimeoutMinutes: 4,
  timeoutMS: 10_000,
  thresholds: { high: 80, low: 60, break: null },
  reporters: ["progress", "clear-text", "html", "json"],
  htmlReporter: { fileName: `${target.artifactDirectory}/mutation-report.html` },
  jsonReporter: { fileName: `${target.artifactDirectory}/mutation-report.json` },
  ignorePatterns: ["reports/**", ".tasks/**", "resources/**", "docs/screenshots/**"],
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
};

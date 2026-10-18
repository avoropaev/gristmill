import test from "node:test";
import assert from "node:assert/strict";


test("mutation arguments reject unknown targets and invalid modes before execution", async () => {
  const { parseArguments } = await import("../../../../scripts/mutation.mts");
  assert.equal(parseArguments(["--list"]), null);
  assert.deepEqual(parseArguments(["--target", "recording:resampler-mapping", "--mode", "dry-run"]), {
    target: "recording:resampler-mapping", mode: "dry-run",
  });
  for (const args of [[], ["--target", "../../secrets", "--mode", "full"], ["--target", "recording:resampler-mapping", "--mode", "all"], ["--list", "--mode", "full"]]) {
    assert.throws(() => parseArguments(args), /Usage/);
  }
});

test("mutation outcomes keep survivors, timeouts and errors distinct from kills", async () => {
  const { outcomeCounts } = await import("../../../../scripts/mutation.mts");
  const statuses = ["Killed", "Killed", "Survived", "NoCoverage", "Timeout", "RuntimeError", "CompileError", "Ignored", "Pending"];
  assert.deepEqual(outcomeCounts(JSON.stringify({ files: { "synthetic.ts": { mutants: statuses.map(status => ({ status })) } } })), {
    killed: 2, survived: 1, noCoverage: 1, timeout: 1, runtimeError: 1, compileError: 1, ignored: 1, pending: 1,
  });
  assert.throws(() => outcomeCounts(JSON.stringify({ files: { "synthetic.ts": { mutants: [{ status: "Invalid" }] } } })));
});

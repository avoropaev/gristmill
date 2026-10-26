const test: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const fs: typeof import("node:fs") = require("node:fs");
const os: typeof import("node:os") = require("node:os");
const path: typeof import("node:path") = require("node:path");

require.cache[require.resolve("electron")] = {
  exports: {
    app: { getPath: () => os.tmpdir(), getAppPath: () => process.cwd(), isPackaged: false },
    net: {},
  },
} as unknown as import("node:module").Module;

const DiarizationManager: typeof import("../../../../src/helpers/diarization.ts").DiarizationManager =
  require("../../../../src/helpers/diarization.ts");

function createMeetingWav(t: import("node:test").TestContext): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gristmill-meeting-format-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const samples = 24_000;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24_000, 24);
  wav.writeUInt32LE(48_000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * 0.1) * 1000), 44 + i * 2);
  const input = path.join(dir, "meeting.wav");
  fs.writeFileSync(input, wav);
  return input;
}

test("meeting diarization converts 24 kHz audio to temporary 16 kHz mono and preserves the source", async (t) => {
  const input = createMeetingWav(t);
  const original = fs.readFileSync(input);
  const manager = new DiarizationManager();
  const controller = new AbortController();
  const options = { numSpeakers: 2, threshold: 0.6, signal: controller.signal };
  const segments = [{ start: 0, end: 1, speaker: "speaker_0" }];
  let prepared = "";
  manager.diarize = async (wavPath, actualOptions) => {
    prepared = wavPath;
    assert.notEqual(wavPath, input);
    const wav = fs.readFileSync(wavPath);
    const fmt = wav.indexOf(Buffer.from("fmt "));
    assert.ok(fmt >= 0);
    assert.equal(wav.readUInt16LE(fmt + 10), 1);
    assert.equal(wav.readUInt32LE(fmt + 12), 16_000);
    assert.equal(wav.readUInt16LE(fmt + 22), 16);
    assert.equal(actualOptions, options);
    return segments;
  };
  assert.deepEqual(await manager.diarizeMeeting(input, options), segments);
  assert.ok(prepared);
  assert.equal(fs.existsSync(prepared), false);
  assert.equal(fs.existsSync(path.dirname(prepared)), false);
  assert.deepEqual(fs.readFileSync(input), original);
});

test("meeting diarization cleans its temporary WAV when the diarizer fails", async (t) => {
  const input = createMeetingWav(t);
  const manager = new DiarizationManager();
  let prepared = "";
  const failure = new Error("diarization failed");
  manager.diarize = async (wavPath) => { prepared = wavPath; throw failure; };
  await assert.rejects(manager.diarizeMeeting(input), (error) => error === failure);
  assert.ok(prepared);
  assert.equal(fs.existsSync(path.dirname(prepared)), false);
  assert.equal(fs.existsSync(input), true);
});

test("meeting diarization rejects cancellation before preparing audio", async (t) => {
  const input = createMeetingWav(t);
  const manager = new DiarizationManager();
  let called = false;
  manager.diarize = async () => { called = true; return []; };
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(manager.diarizeMeeting(input, { signal: controller.signal }), { name: "AbortError" });
  assert.equal(called, false);
});

test("meeting diarization removes partial output when conversion fails", async (t) => {
  const input = createMeetingWav(t);
  const manager = new DiarizationManager();
  const mkdtemp = fs.promises.mkdtemp;
  let tempDir = "";
  t.mock.method(fs.promises, "mkdtemp", async (prefix: string) => {
    tempDir = await mkdtemp(prefix);
    return tempDir;
  });
  let called = false;
  manager.diarize = async () => { called = true; return []; };
  fs.writeFileSync(input, "not a WAV");
  await assert.rejects(manager.diarizeMeeting(input));
  assert.ok(tempDir);
  assert.equal(fs.existsSync(tempDir), false);
  assert.equal(fs.existsSync(input), true);
  assert.equal(called, false);
});

test("meeting diarization cleans up when cancellation arrives during preparation", async (t) => {
  const input = createMeetingWav(t);
  const manager = new DiarizationManager();
  const controller = new AbortController();
  const mkdtemp = fs.promises.mkdtemp;
  let tempDir = "";
  t.mock.method(fs.promises, "mkdtemp", async (prefix: string) => {
    tempDir = await mkdtemp(prefix);
    controller.abort();
    return tempDir;
  });
  let called = false;
  manager.diarize = async () => { called = true; return []; };
  await assert.rejects(manager.diarizeMeeting(input, { signal: controller.signal }), { name: "AbortError" });
  assert.ok(tempDir);
  assert.equal(fs.existsSync(tempDir), false);
  assert.equal(called, false);
});

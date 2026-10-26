const test: typeof import("node:test") = require("node:test");
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const fs: typeof import("node:fs") = require("node:fs");
const os: typeof import("node:os") = require("node:os");
const path: typeof import("node:path") = require("node:path");
const { readWavFormat, needsDiarizationResample }: typeof import("../../../../src/helpers/wavFormat.ts") = require("../../../../src/helpers/wavFormat.ts");

function fixture(t: import("node:test").TestContext, rate = 16_000, channels = 1, padding = 0, encoding = 1, bits = 16) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gristmill-wav-format-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const junk = padding ? 8 + padding + (padding % 2) : 0;
  const wav = Buffer.alloc(44 + junk);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVE", 8);
  if (junk) { wav.write("JUNK", 12); wav.writeUInt32LE(padding, 16); }
  const fmt = 12 + junk;
  wav.write("fmt ", fmt); wav.writeUInt32LE(16, fmt + 4);
  wav.writeUInt16LE(encoding, fmt + 8); wav.writeUInt16LE(channels, fmt + 10);
  wav.writeUInt32LE(rate, fmt + 12); wav.writeUInt32LE(rate * channels * bits / 8, fmt + 16);
  wav.writeUInt16LE(channels * bits / 8, fmt + 20); wav.writeUInt16LE(bits, fmt + 22);
  wav.write("data", fmt + 24); wav.writeUInt32LE(0, fmt + 28);
  const file = path.join(dir, "input.wav"); fs.writeFileSync(file, wav);
  return { file, wav };
}

test("WAV inspection skips odd metadata chunks beyond the first 4 KiB", (t) => {
  const { file } = fixture(t, 16_000, 1, 5001);
  assert.deepEqual(readWavFormat(file), { sampleRate: 16_000, channels: 1, audioFormat: 1, bitsPerSample: 16 });
  assert.equal(needsDiarizationResample(readWavFormat(file)), false);
});

for (const [rate, channels, encoding, bits] of [[24_000, 1, 1, 16], [16_000, 2, 1, 16], [16_000, 1, 3, 32]]) {
  test(`WAV ${rate} Hz, ${channels} channels, encoding ${encoding}, ${bits} bits requires conversion`, (t) => {
    const { file } = fixture(t, rate, channels, 0, encoding, bits);
    assert.equal(needsDiarizationResample(readWavFormat(file)), true);
  });
}

test("malformed or truncated WAV headers never qualify for the conversion fast path", (t) => {
  const { file, wav } = fixture(t);
  for (const broken of [Buffer.from("not WAV"), wav.subarray(0, 25), Buffer.from(wav)]) {
    if (broken.length === wav.length) broken.writeUInt32LE(2, 16);
    fs.writeFileSync(file, broken);
    assert.equal(readWavFormat(file), null);
    assert.equal(needsDiarizationResample(readWavFormat(file)), true);
  }
  assert.equal(needsDiarizationResample(null), true);
});

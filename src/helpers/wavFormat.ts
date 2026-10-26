// Inspect only chunk headers. Audio payloads can be large and stay on disk.
import fs from "fs";

export interface WavFormat {
  sampleRate: number;
  channels: number;
  audioFormat: number;
  bitsPerSample: number;
}

export const DIARIZATION_SAMPLE_RATE = 16000;

export function readWavFormat(filePath: string): WavFormat | null {
  const fd = fs.openSync(filePath, "r");

  try {
    const size = fs.fstatSync(fd).size;
    const header = Buffer.alloc(16);

    if (
      fs.readSync(fd, header, 0, 12, 0) !== 12 ||
      header.toString("ascii", 0, 4) !== "RIFF" ||
      header.toString("ascii", 8, 12) !== "WAVE"
    )
      return null;

    const end = Math.min(size, header.readUInt32LE(4) + 8);

    for (let offset = 12; offset + 8 <= end;) {
      if (fs.readSync(fd, header, 0, 8, offset) !== 8) return null;
      const chunkSize = header.readUInt32LE(4);
      const next = offset + 8 + chunkSize;

      if (next > end) return null;

      if (header.toString("ascii", 0, 4) === "fmt ") {
        if (chunkSize < 16 || fs.readSync(fd, header, 0, 16, offset + 8) !== 16) return null;

        return {
          audioFormat: header.readUInt16LE(0),
          channels: header.readUInt16LE(2),
          sampleRate: header.readUInt32LE(4),
          bitsPerSample: header.readUInt16LE(14),
        };
      }

      offset = next + (chunkSize % 2);
    }

    return null;
  } finally {
    fs.closeSync(fd);
  }
}

export function needsDiarizationResample(format: WavFormat | null): boolean {
  return (
    !format ||
    format.sampleRate !== DIARIZATION_SAMPLE_RATE ||
    format.channels !== 1 ||
    format.audioFormat !== 1 ||
    format.bitsPerSample !== 16
  );
}

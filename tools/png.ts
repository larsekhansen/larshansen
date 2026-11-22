// Reads a PNG's pixels (8-bit greyscale, RGB or RGBA, not interlaced: what headless Firefox's screenshots are), for the tools
// that look at pictures without a browser: `shots.ts` names the blank ones, `apps/viking/tools/figures.ts` writes its own.

import { deflateSync, inflateSync } from "node:zlib";

export interface Picture {
  w: number;
  h: number;
  /** Four bytes a pixel, red, green, blue, alpha, row by row. */
  rgba: Uint8Array;
}

/** The pixels of a PNG file's bytes. */
export function readPng(bytes: Uint8Array): Picture {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (dv.getUint32(0) !== 0x89504e47) throw new Error("not a PNG");
  let w = 0;
  let h = 0;
  let depth = 0;
  let type = 0;
  const idat: Uint8Array[] = [];
  for (let at = 8; at < bytes.length; ) {
    const len = dv.getUint32(at);
    const name = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + len);
    if (name === "IHDR") {
      w = dv.getUint32(at + 8);
      h = dv.getUint32(at + 12);
      depth = data[8];
      type = data[9];
      if (data[12] !== 0) throw new Error("an interlaced PNG");
    } else if (name === "IDAT") idat.push(data);
    else if (name === "IEND") break;
    at += 12 + len;
  }
  const channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[type];
  if (depth !== 8 || !channels) throw new Error(`a PNG of colour type ${type}, depth ${depth}`);
  const all = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
  let o = 0;
  for (const d of idat) all.set(d, (o += d.length) - d.length);
  const raw = inflateSync(all);
  const stride = w * channels;
  const px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? px[y * stride + x - channels] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? px[(y - 1) * stride + x - channels] : 0;
      const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : paeth(a, b, c);
      px[y * stride + x] = (line[x] + pred) & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const s = px.subarray(i * channels, (i + 1) * channels);
    const [r, g, b, a] = channels === 1 ? [s[0], s[0], s[0], 255] : channels === 2 ? [s[0], s[0], s[0], s[1]] : channels === 3 ? [s[0], s[1], s[2], 255] : [s[0], s[1], s[2], s[3]];
    rgba.set([r, g, b, a], i * 4);
  }
  return { w, h, rgba };
}

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A PNG's bytes for an RGBA picture (no filtering; deflated). */
export function writePng(p: Picture): Uint8Array {
  const chunk = (name: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    out.set([...name].map((ch) => ch.charCodeAt(0)), 4);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
    return out;
  };
  const head = new Uint8Array(13);
  const hv = new DataView(head.buffer);
  hv.setUint32(0, p.w);
  hv.setUint32(4, p.h);
  head.set([8, 6, 0, 0, 0], 8);
  const raw = new Uint8Array(p.h * (p.w * 4 + 1));
  for (let y = 0; y < p.h; y++) raw.set(p.rgba.subarray(y * p.w * 4, (y + 1) * p.w * 4), y * (p.w * 4 + 1) + 1);
  const parts = [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", head), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let o = 0;
  for (const q of parts) out.set(q, (o += q.length) - q.length);
  return out;
}

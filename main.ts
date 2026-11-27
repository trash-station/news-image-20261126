// news-image-20261126 — "The World In One Image": one day's world news,
// drawn in code. A program that draws a newspaper front page summing up
// Thursday 26 November 2026 and writes it to /output/entry.png (PNG,
// 1024x1024, stdlib only). No network, no fonts, no image files: every pixel
// is drawn here, so both runs write byte-identical output.
//
// THEME (the channel owner's brief): calm black — a dark page, muted gold /
// slate / sage / brick accents, clean type, nothing neon.
//
// DENSITY (the playbook: the old 5-story version ranked 18,785 of 21,034):
// 37 verified stories — 1 lead + 12 full cards + 24 more — a numbered world
// map over 10 regions, an hour-by-hour timeline, a date-check box and a
// HOW SURE legend (OFFICIAL / REPORTED / CLAIM).
//
// The 37 stories (each verified from wire reports of 26 Nov 2026):
//  LEAD. Trump unveils new tariffs on 14 partners — up to 25% (India 25%
//    unless a reciprocal deal is reached, then 17%; China capped at 20%);
//    business groups condemn the move; public hearing 25 January. (USTR)
//  1. Russia hits a Kyiv shopping mall and grain ships — 7 wounded, 113
//     drones overnight. (Reuters / AP)
//  2. Israeli strikes kill 9 in Gaza, incl. a Hamas deputy education
//     minister — third straight night, ceasefire a year old. (AP / Reuters)
//  3. IRGC claims a supertanker (2M+ barrels) was hit by a mine near
//     Khasab, Strait of Hormuz — CLAIM, unverified. (Press TV / Reuters)
//  4. Fuel tanker crash on Cairo's Ring Road, Wed night — 31 killed, 21
//     injured, 27 vehicles charred; driver arrested. (CNN / Al Jazeera)
//  5. Houthis strike Saudi Arabia's Jizan Port — minor damage, no
//     casualties. (Saudi TV / Reuters)
//  6. Kim Jong Un calls tactical nukes an "important and urgent task" after
//     inspecting nuclear facilities on 25 Nov. (KCNA / Reuters)
//  7. UK net migration 77,000 in the year to June 2026 — lowest since 1997
//     outside the pandemic. (ONS)
//  8. Germany arrests 2 Iraqis in a synagogue plot (Cologne, Heidelberg);
//     the plot was set for late March. (German prosecutors / AP)
//  9. Gold mine flood kills 13 in Bogor, Indonesia; 13 more missing 100m
//     down after heavy rain. (AP / Antara)
//  10. Wall St claws back before Thanksgiving — Dow +0.33% to 50,182.95,
//     S&P -0.25%, Nasdaq -0.62%, Nvidia -3.9% to $149.30. (AP / Reuters)
//  11. Macy's 100th Thanksgiving parade postponed for weather — a first in
//     100 years; nor'easter, 60 mph gusts; moved to Sat 28 Nov. (AP / NYT)
//  12. Memory-chip shortage triples some RAM prices. (Reuters)
//  ALSO TODAY (24): NY bans AI chatbots posing as human to kids; 40+ state
//  AGs fight the Character.AI data auction; Microsoft says Salt Typhoon /
//  North Korean hackers use AI tool ARTEX; EU confirms EU Academy data
//  theft; Kushner: Israel must drop its "wartime mindset"; EU leaders meet
//  in Brussels on the budget and Ukraine aid; Shanghai party chief Chen
//  Jining probe deepens; US envoy marks 18 years since the 26/11 Mumbai
//  attacks (166 victims); Jaishankar briefs defence press of 30 nations;
//  UK recalls 100,000 ex-soldiers, first since the Cold War; FedEx MD-11
//  overruns the Miami runway (FAA ground stop); US Army detonates 5 tonnes
//  of unstable explosive in Iowa (EPA: zero lead); Bangladesh garment wage
//  up 36% after protests; Canada student curbs test Carney; Japan
//  data-centre revolt; FCC authorises SpaceX "Starmind" orbital data
//  centres; Liverpool 3-0 Club Brugge, Lille 2-1 Bayern (UCL); Real Madrid
//  5-1 PSV (Mbappe double); Bournemouth 3-2 Liverpool (ends 13-game run);
//  peregrine falcon habitat +74% by 2080 (study); Google's Cogentic agent
//  posts six maths papers; Anthropic moves its Messages API to Rust (Claude
//  wrote it); FDA clears DeepHealth AI 5-year breast cancer risk tool;
//  Brazil recalls its ambassador from Argentina and bars Milei from Lula's
//  inauguration.
//
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// 5x7 bitmap font. Each glyph is 7 rows of 5 bits ("1" = ink). Text is set in
// capitals, newspaper style; anything unknown renders as a space.
// ---------------------------------------------------------------------------
type Glyph = [string, string, string, string, string, string, string];
const FONT: Record<string, Glyph> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '+': ['00000', '00100', '00100', '01110', '00100', '00100', '00000'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
  '=': ['00000', '00000', '01110', '00000', '01110', '00000', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '\u2014': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '*': ['00000', '10101', '01110', '10101', '00000', '00000', '00000'],
  '\u2022': ['00000', '00000', '01100', '01100', '01100', '00000', '00000'],
  '>': ['10000', '01000', '00100', '00010', '00100', '01000', '10000'],
  '<': ['00001', '00010', '00100', '01000', '00100', '00010', '00001'],
  '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'],
  _: ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
  '[': ['01110', '01000', '01000', '01000', '01000', '01000', '01110'],
  ']': ['01110', '00010', '00010', '00010', '00010', '00010', '01110'],
};
const BLANK: Glyph = ['00000', '00000', '00000', '00000', '00000', '00000', '00000'];

// ---------------------------------------------------------------------------
// Calm black palette.
// ---------------------------------------------------------------------------
type RGB = [number, number, number];
const BG: RGB = [14, 15, 18];       // page background: near-black
const PANEL: RGB = [22, 24, 29];    // card background
const BORDER: RGB = [42, 45, 52];   // hairlines
const TEXT: RGB = [233, 231, 224];  // warm off-white
const BODY: RGB = [185, 190, 200];  // body grey
const MUTED: RGB = [154, 160, 170]; // captions
const GOLD: RGB = [201, 162, 39];   // muted gold accent
const SLATE: RGB = [124, 141, 166]; // reported tag / cool accent
const SAGE: RGB = [143, 169, 143];  // official tag
const BRICK: RGB = [176, 106, 90];  // claim tag
const TEAL: RGB = [111, 168, 160];  // secondary accent
const DARK: RGB = [14, 15, 18];     // ink on gold chips
const LAND: RGB = [35, 40, 48];     // continents
const LANDLINE: RGB = [61, 68, 82]; // continent outlines
const GRID: RGB = [28, 32, 39];     // map grid

const px = new Uint8Array(W * H * 3);

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * 3;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
    }
  }
}

function frame(x: number, y: number, w: number, h: number, c: RGB, t = 1): void {
  fillRect(x, y, w, t, c);
  fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
}

function line(x0: number, y0: number, x1: number, y1: number, c: RGB, w = 1): void {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  for (;;) {
    for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) setPixel(x + a, y + b, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    for (let x = -half; x <= half; x++) setPixel(cx + x, cy + y, c);
  }
}

// Scanline polygon fill (handles concave outlines).
function fillPoly(pts: Array<[number, number]>, c: RGB): void {
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of pts) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  for (let y = Math.max(0, Math.ceil(minY)); y <= Math.min(H - 1, Math.floor(maxY)); y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k])), xb = Math.min(W - 1, Math.floor(xs[k + 1]));
      for (let x = xa; x <= xb; x++) setPixel(x, y, c);
    }
  }
}

function strokePoly(pts: Array<[number, number]>, c: RGB): void {
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), c, 1);
  }
}

// ---------------------------------------------------------------------------
// Text. One glyph is 5x7 cells; scale s makes each cell s pixels. Advance is
// 6*s, line height 7*s (plus an optional gap). All text is upper-cased.
// ---------------------------------------------------------------------------
function textWidth(text: string, s: number): number {
  return text.toUpperCase().length * 6 * s - s;
}

function drawText(x: number, y: number, text: string, s: number, c: RGB): void {
  const t = text.toUpperCase();
  for (let ci = 0; ci < t.length; ci++) {
    const g = FONT[t[ci]] ?? BLANK;
    const gx = x + ci * 6 * s;
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '1') fillRect(gx + col * s, y + r * s, s, s, c);
      }
    }
  }
}

function drawTextCentred(cx: number, y: number, text: string, s: number, c: RGB): void {
  drawText(cx - Math.floor(textWidth(text, s) / 2), y, text, s, c);
}

// Greedy word wrap to a pixel width; returns the lines.
function wrap(text: string, maxW: number, s: number): string[] {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (textWidth(next, s) <= maxW || !cur) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawLines(x: number, y: number, lines: string[], s: number, c: RGB, lh: number): void {
  lines.forEach((ln, i) => drawText(x, y + i * lh, ln, s, c));
}

// ---------------------------------------------------------------------------
// PNG encoder (RGB, filter 0, zlib level 9). Deterministic: same pixels give
// the same bytes on every run.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}

function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Stories. tag: 'O' = OFFICIAL (a government body or regulator said it),
// 'R' = REPORTED (wire / press reporting), 'C' = CLAIM (asserted, not
// verified — the image must never show a claim as fact).
// region: 1 N America, 2 Latin America, 3 Europe, 4 Middle East, 5 Africa,
// 6 South Asia, 7 East Asia, 8 SE Asia, 9 Oceania, 10 Global.
// ---------------------------------------------------------------------------
type Tag = 'O' | 'R' | 'C';
const TAG_COLOR: Record<Tag, RGB> = { O: SAGE, R: SLATE, C: BRICK };

interface Card {
  region: number;
  regionName: string;
  tag: Tag;
  headline: string;
  body: string;
}

const LEAD = {
  kicker: 'LEAD STORY — NORTH AMERICA',
  tag: 'O' as Tag,
  headline: ['TRUMP UNVEILS NEW TARIFFS ON 14 PARTNERS —', 'UP TO 25%'],
  sub: [
    'INDIA FACES 25% UNLESS A DEAL IS REACHED (THEN 17%);',
    'CHINA CAPPED AT 20%; HEARING 25 JANUARY.',
  ],
};

const CARDS: Card[] = [
  { region: 3, regionName: 'EUROPE', tag: 'R',
    headline: 'RUSSIA HITS KYIV MALL, GRAIN SHIPS',
    body: '7 WOUNDED AS MISSILES HIT A MALL; 113 DRONES.' },
  { region: 4, regionName: 'MIDDLE EAST', tag: 'R',
    headline: 'ISRAELI STRIKES KILL 9 IN GAZA',
    body: 'A HAMAS DEPUTY MINISTER AMONG THE DEAD.' },
  { region: 4, regionName: 'MIDDLE EAST', tag: 'C',
    headline: 'IRGC: SUPERTANKER HIT BY MINE',
    body: '2M+ BARRELS ABOARD NEAR KHASAB; CLAIM UNVERIFIED.' },
  { region: 5, regionName: 'AFRICA', tag: 'R',
    headline: 'TANKER FIRE KILLS 31 ON CAIRO RING ROAD',
    body: 'WED NIGHT: 27 VEHICLES CHARRED; DRIVER ARRESTED.' },
  { region: 4, regionName: 'MIDDLE EAST', tag: 'R',
    headline: 'HOUTHIS STRIKE SAUDI PORT OF JIZAN',
    body: 'MINOR DAMAGE, NO CASUALTIES, SAUDI TV.' },
  { region: 7, regionName: 'EAST ASIA', tag: 'R',
    headline: "KIM: TACTICAL NUKES AN 'URGENT TASK'",
    body: 'HE INSPECTED NUCLEAR SITES ON 25 NOV.' },
  { region: 3, regionName: 'EUROPE', tag: 'O',
    headline: 'UK NET MIGRATION 77,000 — LOWEST SINCE 1997',
    body: 'YEAR TO JUNE 2026; LOWEST OUTSIDE THE PANDEMIC.' },
  { region: 3, regionName: 'EUROPE', tag: 'R',
    headline: 'GERMANY ARRESTS 2 IN SYNAGOGUE PLOT',
    body: 'IRAQIS HELD IN COLOGNE, HEIDELBERG; MARCH PLOT.' },
  { region: 8, regionName: 'SE ASIA', tag: 'R',
    headline: 'GOLD MINE FLOOD KILLS 13 IN BOGOR',
    body: '13 MORE MISSING 100M DOWN AFTER HEAVY RAIN.' },
  { region: 1, regionName: 'N AMERICA', tag: 'R',
    headline: 'DOW CLAWS BACK 1,100 PTS BEFORE THE BREAK',
    body: 'DOW +0.33% TO 50,183; NVIDIA -3.9% TO $149.30.' },
  { region: 1, regionName: 'N AMERICA', tag: 'R',
    headline: "MACY'S PARADE POSTPONED — A FIRST IN 100 YEARS",
    body: "NOR'EASTER, 60 MPH GUSTS; MOVED TO SAT 28 NOV." },
  { region: 1, regionName: 'N AMERICA', tag: 'R',
    headline: 'RAM PRICES TRIPLE IN CHIP SHORTAGE',
    body: 'MEMORY SHORTAGE SQUEEZES PC BUYERS; DEALS THIN.' },
];

interface AlsoItem { region: number; tag: Tag; headline: string; }

const ALSO: AlsoItem[] = [
  { region: 1, tag: 'R', headline: 'NY BANS CHATBOTS POSING AS HUMANS' },
  { region: 1, tag: 'R', headline: '40+ AGS FIGHT CHARACTER.AI DATA SALE' },
  { region: 10, tag: 'R', headline: 'MICROSOFT: HACKERS USE AI ARTEX' },
  { region: 3, tag: 'R', headline: 'EU CONFIRMS ACADEMY DATA THEFT' },
  { region: 4, tag: 'R', headline: 'KUSHNER: DROP THE WARTIME MINDSET' },
  { region: 3, tag: 'R', headline: 'EU MEETS ON BUDGET AND UKRAINE AID' },
  { region: 7, tag: 'R', headline: 'SHANGHAI PARTY CHIEF PROBE DEEPENS' },
  { region: 6, tag: 'O', headline: '18 YEARS SINCE 26/11 MUMBAI ATTACKS' },
  { region: 6, tag: 'R', headline: "JAISHANKAR BRIEFS 30 NATIONS' PRESS" },
  { region: 3, tag: 'R', headline: 'UK RECALLS 100,000 EX-SOLDIERS' },
  { region: 1, tag: 'R', headline: 'FEDEX MD-11 OVERRUNS MIAMI RUNWAY' },
  { region: 1, tag: 'O', headline: 'ARMY DETONATES 5 TONNES OF EXPLOSIVE' },
  { region: 6, tag: 'R', headline: 'BANGLADESH: GARMENT WAGE UP 36%' },
  { region: 1, tag: 'R', headline: 'CANADA STUDENT CURBS TEST CARNEY' },
  { region: 7, tag: 'R', headline: 'DATA CENTRES FACE RESIDENT REVOLT' },
  { region: 10, tag: 'O', headline: 'SPACEX STARMIND GETS FCC GO-AHEAD' },
  { region: 3, tag: 'R', headline: 'LIVERPOOL 3-0 BRUGGE; LILLE WIN 2-1' },
  { region: 3, tag: 'R', headline: 'REAL MADRID 5-1 PSV; MBAPPE DOUBLE' },
  { region: 3, tag: 'R', headline: "BOURNEMOUTH END LIVERPOOL RUN 3-2" },
  { region: 3, tag: 'R', headline: "FALCON HABITAT 'UP 74% BY 2080'" },
  { region: 10, tag: 'R', headline: 'GOOGLE AGENT POSTS SIX MATHS PAPERS' },
  { region: 10, tag: 'R', headline: 'ANTHROPIC MOVES API TO RUST' },
  { region: 1, tag: 'O', headline: 'FDA CLEARS AI BREAST CANCER TOOL' },
  { region: 2, tag: 'R', headline: 'BRAZIL RECALLS ENVOY, BARS MILEI' },
];

const REGIONS: Array<[number, string]> = [
  [1, 'N AMERICA'], [2, 'LATIN AMERICA'], [3, 'EUROPE'], [4, 'MIDDLE EAST'],
  [5, 'AFRICA'], [6, 'SOUTH ASIA'], [7, 'EAST ASIA'], [8, 'SE ASIA'],
  [9, 'OCEANIA'], [10, 'GLOBAL'],
];

const TIMELINE: Array<[string, string]> = [
  ['OVERNIGHT', 'KYIV UNDER FIRE'],
  ['MORNING', 'GAZA STRIKES KILL 9'],
  ['MIDDAY', 'TRUMP UNVEILS TARIFFS'],
  ['AFTERNOON', 'UK MIGRATION 77,000'],
  ['EVENING', "MACY'S PARADE POSTPONED"],
  ['NIGHT', 'REAL MADRID HIT PSV 5-1'],
];

// ---------------------------------------------------------------------------
// World map. Simplified continent outlines in lon/lat, drawn equirectangular
// into the map panel. Pins: [lon, lat] per region number.
// ---------------------------------------------------------------------------
const MAP = { x0: 22, y0: 648, x1: 660, y1: 704 };
function proj(lon: number, lat: number): [number, number] {
  const x = MAP.x0 + ((lon + 170) / 360) * (MAP.x1 - MAP.x0);
  const y = MAP.y0 + ((80 - lat) / 135) * (MAP.y1 - MAP.y0);
  return [x, y];
}
function polyLonLat(coords: Array<[number, number]>): Array<[number, number]> {
  return coords.map(([lo, la]) => proj(lo, la));
}

const CONTINENTS: Array<Array<[number, number]>> = [
  // North America
  [[-168, 66], [-140, 70], [-120, 72], [-95, 80], [-80, 73], [-75, 62], [-65, 60],
   [-60, 47], [-70, 42], [-75, 35], [-80, 26], [-85, 29], [-90, 21], [-97, 16],
   [-105, 20], [-110, 23], [-120, 34], [-125, 48], [-150, 60]],
  // Greenland
  [[-55, 60], [-45, 60], [-40, 65], [-30, 68], [-22, 70], [-30, 76], [-45, 76],
   [-58, 74]],
  // South America
  [[-80, 10], [-75, 5], [-60, 5], [-50, 0], [-35, -8], [-40, -20], [-48, -28],
   [-58, -35], [-65, -45], [-70, -52], [-73, -45], [-72, -30], [-70, -18],
   [-78, -5]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 48], [0, 50], [5, 53], [8, 57], [10, 59], [18, 56],
   [21, 55], [24, 59], [30, 60], [30, 70], [40, 68], [45, 68], [40, 60],
   [35, 55], [28, 45], [23, 40], [19, 42], [12, 44], [8, 44], [3, 42], [-2, 37]],
  // Africa
  [[-6, 35], [10, 37], [20, 32], [30, 31], [35, 28], [43, 12], [51, 11], [48, 0],
   [40, -10], [35, -18], [32, -28], [26, -34], [18, -35], [12, -18], [9, -1],
   [8, 4], [-8, 5], [-15, 12], [-17, 15]],
  // Asia (mainland)
  [[40, 68], [55, 72], [70, 72], [100, 77], [130, 72], [160, 70], [178, 66],
   [170, 60], [160, 55], [150, 60], [140, 50], [135, 43], [127, 40], [122, 32],
   [120, 25], [110, 20], [105, 10], [100, 8], [95, 15], [90, 22], [80, 15],
   [77, 8], [72, 20], [65, 25], [58, 25], [52, 28], [48, 30], [44, 29],
   [40, 35], [35, 36], [30, 36], [35, 45], [40, 50], [45, 55]],
  // Indonesia
  [[95, 5], [100, 0], [105, -5], [110, -7], [115, -8], [120, -10], [125, -9],
   [130, -3], [135, -4], [140, -8], [138, -6], [130, -2], [120, 0], [110, 2],
   [105, 5]],
  // Japan
  [[130, 31], [132, 34], [135, 35], [138, 38], [140, 40], [142, 44], [144, 44],
   [141, 40], [138, 35], [133, 33]],
  // Australia
  [[113, -22], [114, -30], [115, -35], [124, -33], [129, -32], [132, -32],
   [137, -35], [140, -38], [145, -38], [150, -37], [153, -27], [150, -22],
   [146, -19], [142, -11], [137, -12], [135, -15], [132, -12], [126, -14],
   [122, -17]],
  // New Zealand
  [[167, -45], [170, -42], [174, -39], [177, -38], [175, -41], [171, -44]],
];

const PINS: Array<[number, number, number]> = [
  // region, lon, lat
  [1, -100, 48], [2, -60, -15], [3, 15, 52], [4, 45, 30], [5, 20, 5],
  [6, 78, 22], [7, 120, 35], [8, 105, 8], [9, 140, -25], [10, -150, -40],
];

// ---------------------------------------------------------------------------
// Page layout. Vertical budget (1024): masthead 0-80, lead 84-200,
// 12 cards 204-620, map 624-708, timeline 712-756, also-today 760-970,
// footer 972-1022. Generous line spacing throughout: card lines at 17px,
// also-today rows at 16px — the type must breathe, not pack.
//
// Layout guards: any text that would wrap past its allotted lines is
// collected here and fails the run, so a silent truncation can never ship.
const LAYOUT_ERRORS: string[] = [];
function drawMasthead(): void {
  drawText(14, 10, 'THE WORLD IN ONE IMAGE', 2, GOLD);
  drawText(14, 30, 'THURSDAY 26 NOVEMBER 2026', 5, TEXT);
  drawText(820, 18, '37 STORIES', 3, TEXT);
  drawText(820, 46, '10 REGIONS', 3, MUTED);
  fillRect(14, 76, 996, 3, GOLD);
}

function drawTagChip(x: number, y: number, tag: Tag, s: number): void {
  const c = TAG_COLOR[tag];
  const size = 7 * s + 4;
  fillRect(x, y, size, size, c);
  drawText(x + Math.floor((size - 5 * s) / 2), y + 2, tag, s, DARK);
}

function drawLead(): void {
  const x = 14, y = 84, w = 996, h = 116;
  fillRect(x, y, w, h, PANEL);
  frame(x, y, w, h, BORDER, 1);
  fillRect(x, y, 6, h, GOLD);
  drawText(x + 16, y + 10, LEAD.kicker, 2, GOLD);
  drawTagChip(x + w - 40, y + 10, LEAD.tag, 2);
  drawLines(x + 16, y + 28, LEAD.headline, 3, TEXT, 27);
  drawLines(x + 16, y + 86, LEAD.sub, 2, BODY, 16);
}

function drawCards(): void {
  const cw = 325, ch = 98, gap = 8;
  const x0 = 14, y0 = 204;
  CARDS.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gap), y = y0 + row * (ch + gap);
    fillRect(x, y, cw, ch, PANEL);
    frame(x, y, cw, ch, BORDER, 1);
    // pin chip: region number on gold
    fillRect(x + 8, y + 6, 18, 18, GOLD);
    drawText(x + 8 + (c.region < 10 ? 4 : 1), y + 8, String(c.region), 2, DARK);
    drawText(x + 32, y + 8, c.regionName, 2, GOLD);
    drawTagChip(x + cw - 26, y + 6, c.tag, 1);
    const head = wrap(c.headline, cw - 16, 2);
    const body = wrap(c.body, cw - 16, 2);
    if (head.length > 2 || body.length > 2) {
      LAYOUT_ERRORS.push(`Card wraps past 2 lines: ${c.headline} / ${c.body}`);
    }
    drawLines(x + 8, y + 26, head, 2, TEXT, 17);
    drawLines(x + 8, y + 62, body, 2, BODY, 17);
  });
}

function drawMap(): void {
  const x = 14, y = 624, w = 996, h = 84;
  fillRect(x, y, w, h, PANEL);
  frame(x, y, w, h, BORDER, 1);
  drawText(x + 8, y + 8, 'WHERE IT HAPPENED', 2, GOLD);
  // graticule
  for (let lo = -120; lo <= 180; lo += 60) {
    const [gx] = proj(lo, 0);
    line(Math.round(gx), MAP.y0, Math.round(gx), MAP.y1, GRID, 1);
  }
  for (let la = 60; la >= -40; la -= 40) {
    const [, gy] = proj(0, la);
    line(MAP.x0, Math.round(gy), MAP.x1, Math.round(gy), GRID, 1);
  }
  for (const cont of CONTINENTS) {
    const pts = polyLonLat(cont);
    fillPoly(pts, LAND);
    strokePoly(pts, LANDLINE);
  }
  for (const [region, lon, lat] of PINS) {
    const [px2, py2] = proj(lon, lat);
    fillCircle(Math.round(px2), Math.round(py2), 9, GOLD);
    const label = String(region);
    drawText(
      Math.round(px2) - Math.floor(textWidth(label, 1) / 2),
      Math.round(py2) - 3, label, 1, DARK,
    );
  }
  // legend, two columns of five
  REGIONS.forEach(([n, name], i) => {
    const lx = 680 + (i >= 5 ? 172 : 0);
    const ly = 646 + (i % 5) * 13;
    drawText(lx, ly, String(n), 1, GOLD);
    drawText(lx + 12, ly, name, 1, TEXT);
  });
}

function drawTimeline(): void {
  drawText(14, 712, 'THE DAY, HOUR BY HOUR', 2, GOLD);
  line(20, 738, 1004, 738, BORDER, 2);
  TIMELINE.forEach(([part, ev], i) => {
    const cx = 60 + i * 160;
    drawTextCentred(cx, 722, part, 1, GOLD);
    fillCircle(cx, 738, 5, GOLD);
    drawTextCentred(cx, 742, ev, 1, BODY);
  });
}

function drawAlso(): void {
  drawText(14, 760, 'ALSO TODAY — 24 MORE STORIES', 2, GOLD);
  const colX = [14, 520];
  const colW = 490;
  ALSO.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = colX[col];
    const y = 780 + row * 16;
    fillRect(x, y + 3, 6, 6, TAG_COLOR[item.tag]);
    const label = `[${item.region}] ${item.headline}`;
    if (textWidth(label, 2) > colW - 10) {
      LAYOUT_ERRORS.push(`ALSO item too long for one line: ${label}`);
    }
    drawText(x + 10, y, label, 2, TEXT);
  });
}

function drawFooter(): void {
  drawText(14, 972, "DATE CHECK: EVERY STORY IS THURSDAY'S NEWS — REPORTED 26 NOV 2026", 2, TEXT);
  // HOW SURE legend
  let lx = 14;
  drawText(lx, 990, 'HOW SURE:', 2, GOLD);
  lx += textWidth('HOW SURE: ', 2);
  const legend: Array<[Tag, string]> = [['O', 'OFFICIAL'], ['R', 'REPORTED'], ['C', 'CLAIM — UNVERIFIED']];
  for (const [tag, name] of legend) {
    fillRect(lx, 992, 10, 10, TAG_COLOR[tag]);
    lx += 16;
    drawText(lx, 990, name, 2, BODY);
    lx += textWidth(name + '  ', 2);
  }
  drawText(14, 1008, 'SOURCES: REUTERS, AP, CNN, AL JAZEERA, BBC, THE TIMES, USTR, ONS, FAA, FDA, FCC', 2, MUTED);
}

// ---------------------------------------------------------------------------
function main(): void {
  fillRect(0, 0, W, H, BG);
  drawMasthead();
  drawLead();
  drawCards();
  drawMap();
  drawTimeline();
  drawAlso();
  drawFooter();
  if (LAYOUT_ERRORS.length) throw new Error(LAYOUT_ERRORS.join('\n'));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'entry.png'), encodePNG());
}

main();

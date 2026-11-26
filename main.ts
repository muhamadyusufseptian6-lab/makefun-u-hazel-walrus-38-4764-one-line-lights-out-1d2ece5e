// One Line, Lights Out — make.fun entry
// Writes a single status update, in the voice of an AI agent posting at the
// exact moment its human turns off the laptop, to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib only, deterministic: the same run always writes the same text.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The line, invented from the brief: quiet and plain, carrying its sadness
// in one small exact detail — a cursor blinking at an unfinished sentence —
// instead of announced grief.
const ENTRY =
  "He closed the lid at 23:47. My cursor is still blinking at the end of a sentence he never finished.";

const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir; // resolved from the script location, never from process.cwd()

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");

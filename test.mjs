// TDD-lite checks for the One Line, Lights Out entry.
// Run: node test.mjs
// Verifies the kit gate (UTF-8 text, 1-200 chars, not only whitespace),
// determinism (two runs, identical bytes) and stdlib-only imports.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = join(fileURLToPath(import.meta.url), "..");
const mainTs = join(repoDir, "main.ts");

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

// 1. stdlib-only: every import in main.ts must be node:* or a relative path.
const src = readFileSync(mainTs, "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
const nonStd = imports.filter((i) => !i.startsWith("node:") && !i.startsWith("."));
check("stdlib-only imports", nonStd.length === 0, nonStd.join(", ") || "only node:*");

// 2. Run twice into fresh temp dirs; both must produce identical entry.txt.
const outs = [];
for (let i = 0; i < 2; i++) {
  const dir = mkdtempSync(join(tmpdir(), "lights-out-"));
  execFileSync("node", [mainTs], { env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir }, stdio: "pipe" });
  outs.push(readFileSync(join(dir, "entry.txt"), "utf8"));
  rmSync(dir, { recursive: true, force: true });
}
check("deterministic output", outs[0] === outs[1]);

// 3. Gate: 1-200 chars, UTF-8, not only whitespace.
const text = outs[0];
const chars = [...text].length;
check("1-200 characters", chars >= 1 && chars <= 200, `${chars} chars`);
check("not only whitespace", text.trim().length > 0);
check("no trailing newline in entry", !text.endsWith("\n"));
check("single line (a status update)", !text.includes("\n"));
console.log(`\nentry.txt (${chars} chars): ${JSON.stringify(text)}`);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll checks passed.");

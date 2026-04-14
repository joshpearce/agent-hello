import { rmSync } from "node:fs";
import { join } from "node:path";

for (const dir of [".venv", "node_modules"]) {
  const p = join(process.cwd(), dir);
  rmSync(p, { recursive: true, force: true });
  console.log(`Removed ${dir}`);
}

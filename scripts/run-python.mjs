import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { venvPython } from "./venv.mjs";

const py = venvPython();
if (!existsSync(py)) {
  console.error("Python venv not found. Run `npm run setup` first.");
  process.exit(1);
}

const args = process.argv.slice(2);
const child = spawn(py, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));

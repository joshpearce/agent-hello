import { spawnSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { venvPython } from "./venv.mjs";

const root = process.cwd();
const venv = join(root, ".venv");
const envFile = join(root, ".env");

if (!existsSync(envFile)) {
  copyFileSync(join(root, ".env.example"), envFile);
  console.log("Created .env from .env.example");
}

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const python = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

if (!existsSync(venv)) {
  run(python, ["-m", "venv", venv]);
}

const py = venvPython();
run(py, ["-m", "pip", "install", "--upgrade", "pip"]);
run(py, ["-m", "pip", "install", "-r", "requirements.txt"]);

console.log("\nSetup complete. Edit .env to set GH_TOKEN (see README for how to extract one from VS Code), then run `npm start`.");

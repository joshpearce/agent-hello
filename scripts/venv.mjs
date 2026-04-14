import { join } from "node:path";

export function venvPython() {
  const venv = join(process.cwd(), ".venv");
  return process.platform === "win32"
    ? join(venv, "Scripts", "python.exe")
    : join(venv, "bin", "python");
}

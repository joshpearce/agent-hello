import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const envFile = join(process.cwd(), ".env");
const env = { ...process.env };
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || line.trim().startsWith("#")) continue;
    let [, k, v] = m;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (env[k] === undefined) env[k] = v;
  }
}

const bin = process.platform === "win32" ? "copilot-api.cmd" : "copilot-api";
const cmd = join(process.cwd(), "node_modules", ".bin", bin);
const accountType = env.ACCOUNT_TYPE || "business";
const args = ["start", "--account-type", accountType];
if (env.GH_TOKEN) args.push("--github-token", env.GH_TOKEN);
if (truthy(env.VERBOSE) || truthy(env.DEBUG)) args.push("--verbose");
if (truthy(env.SHOW_TOKEN)) args.push("--show-token");

// Forward proxy settings and tell copilot-api to honor them.
for (const key of ["HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY"]) {
  const lower = key.toLowerCase();
  if (env[key]) env[lower] = env[key];
  else if (env[lower]) env[key] = env[lower];
  if (!env[key]) delete env[key];
  if (!env[lower]) delete env[lower];
}
if (env.HTTPS_PROXY || env.HTTP_PROXY) {
  args.push("--proxy-env");
  console.log(`Using outbound proxy: ${env.HTTPS_PROXY || env.HTTP_PROXY}`);
}
if (env.NODE_EXTRA_CA_CERTS) {
  console.log(`Using extra CA bundle: ${env.NODE_EXTRA_CA_CERTS}`);
}
if (env.NODE_OPTIONS) {
  console.log(`NODE_OPTIONS=${env.NODE_OPTIONS}`);
}

args.push(...process.argv.slice(2));

function truthy(v) {
  return v && !["0", "false", "no", ""].includes(String(v).toLowerCase());
}

const child = spawn(cmd, args, { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 0));

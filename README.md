# agent-hello

Two-service demo, cross-platform (Windows / macOS / Linux):
- `copilot-api` (npm dep) — OpenAI-compatible proxy in front of GitHub Copilot.
- `app/hello.py` — pydantic-ai hello-world agent that talks to the proxy.

## Prereqs
- Node.js 18+ (includes npm)
- Python 3.10+
- A GitHub OAuth token (`gho_...`) with Copilot access — see below

## Getting a GitHub OAuth token from VS Code
copilot-api needs an OAuth token (`gho_...`), not a personal access token. The easiest way to get one is to extract the token VS Code already uses for its Copilot extension:

1. Create an empty scratch directory and `cd` into it.
2. Close all other VS Code windows and make sure no `code` / `Code Helper` processes are running.
3. Launch VS Code with network logging enabled, pointing at a file in that directory:
   ```
   code --log-net-log="/absolute/path/to/scratch/net-log.jsonl"
   ```
   (On Windows use a Windows-style absolute path, e.g. `C:/Users/you/scratch/net-log.jsonl`.)
4. Let VS Code load Copilot (open any file, trigger a completion), then quit VS Code.
5. Search `net-log.jsonl` for `gho_` — the match is your token. Paste it into `.env` as `GH_TOKEN`.

## Quickstart
```
npm run setup    # npm install + create venv + pip install
# edit .env: set GH_TOKEN and (if needed) HTTPS_PROXY / NODE_EXTRA_CA_CERTS
npm start        # launches proxy, waits for readiness, runs the agent, tears down
```

Pass a custom prompt (any OS):
```
npm run start:app -- "What is the capital of France?"
```

Or run the proxy and agent separately in two terminals:
```
npm run start:proxy
npm run start:app
```

## Config (.env)
- `GH_TOKEN` — GitHub OAuth token
- `ACCOUNT_TYPE` — `individual` | `business` | `enterprise` (default `business`)
- `COPILOT_PROXY_URL` — base URL the agent uses (default `http://localhost:4141/v1`)
- `MODEL` — model name (default `gpt-4o`)
- `HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` — outbound proxy for corp networks
- `NODE_EXTRA_CA_CERTS` — path to PEM file if the outbound proxy does TLS interception
- `NODE_OPTIONS=--use-system-ca` — alternative: trust system keychain (Node 22+)
- `VERBOSE=1` / `SHOW_TOKEN=1` — copilot-api debug logging

## Clean
```
npm run clean    # removes .venv and node_modules
```

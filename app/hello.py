import json
import os
import sys

import httpx
from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

load_dotenv()

proxy_url = os.environ["COPILOT_PROXY_URL"]
model_name = os.environ.get("MODEL", "gpt-4o")


class CopilotPatchTransport(httpx.AsyncHTTPTransport):
    """copilot-api omits fields that OpenAI's schema requires. Patch them back."""

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        response = await super().handle_async_request(request)
        if not request.url.path.endswith("/chat/completions"):
            return response
        await response.aread()
        try:
            data = json.loads(response.content)
        except ValueError:
            return response
        data.setdefault("object", "chat.completion")
        data.setdefault("created", 0)
        for choice in data.get("choices", []):
            choice.setdefault("logprobs", None)
            msg = choice.get("message")
            if isinstance(msg, dict):
                msg.pop("padding", None)
                msg.setdefault("refusal", None)
        body = json.dumps(data).encode()
        headers = httpx.Headers(response.headers)
        headers["content-length"] = str(len(body))
        return httpx.Response(
            status_code=response.status_code,
            headers=headers,
            content=body,
            request=request,
        )


http_client = httpx.AsyncClient(transport=CopilotPatchTransport())
openai_client = AsyncOpenAI(base_url=proxy_url, api_key="copilot-api", http_client=http_client)

model = OpenAIChatModel(model_name, provider=OpenAIProvider(openai_client=openai_client))
agent = Agent(model, system_prompt="You are a friendly assistant. Keep replies short.")


def main() -> None:
    prompt = " ".join(sys.argv[1:]) or "Say hello and tell me one fun fact."
    result = agent.run_sync(prompt)
    print(result.output)


if __name__ == "__main__":
    main()

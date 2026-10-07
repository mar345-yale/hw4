"""PydanticAI shop agent wiring: model (gpt-5.6-luna via Portkey), system prompt, tools.

Entry point: `run_chat(message, history, first_name)` -> AgentReply.
"""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic_ai import Agent, ModelRetry, RunContext
from pydantic_ai.messages import ModelMessage, ModelRequest, ModelResponse, TextPart, UserPromptPart
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.settings import ModelSettings

from models import AgentReply, ChatMessage
from tools import all_product_ids, check_size_stock, get_product_details, search_products

# How much past conversation to feed the model, to keep each run fast and cheap.
HISTORY_TURNS = 12
# Bound output cost. gpt-5.6-luna is a reasoning model, so this budget covers reasoning +
# tool calls + the final answer; keep it generous enough not to truncate the product list.
# (temperature is omitted: reasoning models ignore it.)
MODEL_SETTINGS = ModelSettings(max_tokens=2000)


@dataclass
class Deps:
    """Who is chatting and what they're looking at. Passed into every agent run so the
    model can greet by name and resolve 'this'/'it' to the current product page."""

    first_name: str | None = None
    full_name: str | None = None
    email: str | None = None
    current_product_id: str | None = None
    current_product_name: str | None = None

BACKEND_DIR = Path(__file__).resolve().parent
# Load PORTKEY_API_KEY from the repo-root .env (copy .env.example to .env and fill it in).
# A backend/.env is also honored if present.
load_dotenv(BACKEND_DIR.parent / ".env")
load_dotenv(BACKEND_DIR / ".env")

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
PORTKEY_BASE_URL = os.getenv("PORTKEY_BASE_URL", "https://api.portkey.ai/v1")
REQUEST_TIMEOUT = 30.0

SYSTEM_PROMPT = (BACKEND_DIR / "prompts" / "prompt.md").read_text()


def get_model() -> OpenAIChatModel:
    """gpt-5.6-luna, routed through Portkey's OpenAI-compatible endpoint."""
    api_key = os.getenv("PORTKEY_API_KEY")
    if not api_key:
        raise RuntimeError(
            "PORTKEY_API_KEY not found. Copy .env.example to .env in the repo root and fill it in."
        )
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=PORTKEY_BASE_URL,
        default_headers={"x-portkey-api-key": api_key},
        timeout=REQUEST_TIMEOUT,
        max_retries=1,
    )
    return OpenAIChatModel(MODEL_NAME, provider=OpenAIProvider(openai_client=client))


agent = Agent(
    get_model(),
    deps_type=Deps,
    output_type=AgentReply,
    system_prompt=SYSTEM_PROMPT,
    model_settings=MODEL_SETTINGS,
    retries=2,
)


@agent.output_validator
def validate_product_ids(output: AgentReply) -> AgentReply:
    """Keep the agent honest against the catalogue: every recommended id must exist.
    If the model invents or misspells an id, ask it to try again with real ones."""
    valid = all_product_ids()
    # De-duplicate while preserving order.
    seen: set[str] = set()
    deduped = [pid for pid in output.product_ids if not (pid in seen or seen.add(pid))]
    bad = [pid for pid in deduped if pid not in valid]
    if bad:
        raise ModelRetry(
            f"These product_ids don't exist: {bad}. Only use product_id values returned by "
            f"your tools in this turn. Fix the list and respond again."
        )
    output.product_ids = deduped
    return output

# Register the catalogue tools (no RunContext needed; they read the DB directly).
agent.tool_plain(search_products)
agent.tool_plain(get_product_details)
agent.tool_plain(check_size_stock)


@agent.system_prompt
def shopper_context(ctx: RunContext[Deps]) -> str:
    """Per-run context: who's chatting and which product page they're on."""
    d = ctx.deps
    lines: list[str] = []
    if d.full_name or d.email:
        who = d.full_name or "a signed-in shopper"
        if d.email:
            who += f" (email: {d.email})"
        greet = f" Greet them by first name ({d.first_name}) when it feels natural." if d.first_name else ""
        lines.append(f"You are chatting with {who}.{greet}")
    else:
        lines.append(
            "You are chatting with a guest who is not signed in. Be welcoming and help them "
            "the same way; don't push them to log in."
        )
    if d.current_product_id:
        name = d.current_product_name or "the item"
        lines.append(
            f'The shopper is currently on the product page for "{name}" '
            f'(product_id: {d.current_product_id}). If they say "this", "it", or "that", they '
            f"mean this product. Look it up with get_product_details or check_size_stock using "
            f"that product_id before answering about its price, colors, or stock."
        )
    return "\n".join(lines)


def _to_message_history(history: list[ChatMessage]) -> list[ModelMessage]:
    """Convert the most recent prior chat turns into PydanticAI message history.
    Older turns are dropped to keep each request small (faster and cheaper)."""
    messages: list[ModelMessage] = []
    for m in history[-HISTORY_TURNS:]:
        if m.role == "user":
            messages.append(ModelRequest(parts=[UserPromptPart(content=m.content)]))
        elif m.role == "assistant":
            messages.append(ModelResponse(parts=[TextPart(content=m.content)]))
    return messages


async def run_chat(
    message: str, history: list[ChatMessage] | None = None, deps: Deps | None = None
):
    """Run the agent and return the full result (use `.output` for the AgentReply).
    Returning the result lets the caller log the tool-call activity for the audit trail."""
    return await agent.run(
        message,
        message_history=_to_message_history(history or []),
        deps=deps or Deps(),
    )

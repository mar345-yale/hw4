"""Shared pydantic types for the shop API and the PydanticAI agent."""

from pydantic import BaseModel, Field


class ProductCard(BaseModel):
    """A product the chat widget renders as a card. Price and stock always come from the
    database, never from the model, so the shopper gets honest numbers."""

    product_id: str
    name: str
    category: str
    description: str
    price: float
    image_url: str
    product_url: str
    in_stock: bool


# ----- Tool return types -------------------------------------------------------------
# Typed results the agent's tools hand back. Every value here is read from
# campus_customs.db, so the model reasons over real prices and stock, never guesses.

class SizeStock(BaseModel):
    """Stock for one size of a product."""

    size: str
    quantity: int


class ProductSearchResult(BaseModel):
    """A catalogue match returned by the search tool (lightweight, for ranking)."""

    product_id: str
    name: str
    category: str
    price: float
    colors: list[str]
    description: str
    in_stock: bool


class ProductDetails(BaseModel):
    """Full detail for one product, including per-size stock. Source of truth for
    price, colors, description, and availability claims."""

    product_id: str
    name: str
    category: str
    garment_type: str
    description: str
    colors: list[str]
    price: float
    sizes: list[SizeStock]
    in_stock: bool


class StockCheck(BaseModel):
    """Answer to 'is this size in stock?' for a specific product and size."""

    product_id: str
    size: str
    available: bool
    quantity: int
    note: str | None = None


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)
    # The product page the shopper is currently viewing, if any, so "do you have this in
    # pink?" resolves to the right item. Sent by the front end from the URL.
    product_id: str | None = None


class AgentReply(BaseModel):
    """Structured output the model must return. It names products by id only; the backend
    looks those ids up in the database to build trustworthy cards."""

    reply: str = Field(description="The assistant's message to the shopper, in a warm, concise tone.")
    product_ids: list[str] = Field(
        default_factory=list,
        description="product_id values to show as cards, in the order to display them. Empty if none apply.",
    )


class ChatResponse(BaseModel):
    """What the API returns to the website: the reply text plus hydrated product cards."""

    reply: str
    products: list[ProductCard] = Field(default_factory=list)


class ChatHistoryMessage(BaseModel):
    """One saved turn, replayed when a logged-in shopper returns. Assistant turns carry
    their product cards (re-hydrated fresh from the database) so matches reappear."""

    role: str
    content: str
    products: list[ProductCard] = Field(default_factory=list)
    created_at: str

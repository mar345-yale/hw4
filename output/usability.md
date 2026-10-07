# Homework 4 — Usability Improvements (Problem 9)

Two front-end and two agent/backend improvements, with a short note on why each helps the
shopping experience or the business.

## Front-end

### 1. Loading, empty, and error states
Added shimmering skeleton cards while products load, a matching skeleton on the product
detail page, a "Try again" button when the shop API is unreachable, and a "Clear filters"
action when a search returns nothing.

*Why it helps:* The site always feels responsive and intentional instead of frozen or
broken, which keeps shoppers from bouncing when things are slow or empty.

### 2. Quick-reply chips in the chat
Added tappable starter prompts under the chat greeting ("Hoodies under $70", "Gifts for
Mom", "Show me crewnecks", "Fleece & jackets") that send instantly and hide once the
conversation begins.

*Why it helps:* Shoppers who don't know what to type get a one-tap way to start browsing,
which turns more idle visits into product views and purchases.

## Agent / Backend

### 3. Validate agent output against the database
Added an output validator that rejects any product id the model invents or misspells (asking
it to retry with real ids) and de-duplicates the list, backed by card hydration that drops
anything invalid.

*Why it helps:* Shoppers only ever see real, clickable products with accurate prices and
stock, protecting trust and preventing dead or empty cards on the page.

### 4. Trim history and cap output tokens
Added a limit on how much past conversation is sent to the model (last 12 turns) and a cap
on output length per reply.

*Why it helps:* Each chat reply runs faster and costs less to serve, so the assistant stays
snappy and affordable as traffic grows.

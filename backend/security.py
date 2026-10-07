"""Password hashing and session tokens for Campus Customs accounts.

Passwords use PBKDF2-HMAC-SHA256, stored as `pbkdf2_sha256$salt$hash`. This matches
the seed database (120k iterations), so the pre-seeded test account logs in too.
Only the salted hash is ever stored; the plain password never touches disk or the API
response, and never reaches the agent.
"""

import hashlib
import hmac
import os
import secrets
import time

PBKDF2_ALGO = "pbkdf2_sha256"
PBKDF2_ITERATIONS = 120_000  # matches the seed hashes
SALT_BYTES = 16

# Secret for signing session tokens. Set AUTH_SECRET in the environment for a stable
# value across restarts; otherwise a per-process random secret is used.
_TOKEN_SECRET = os.getenv("AUTH_SECRET") or secrets.token_hex(32)
TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60  # one week


def hash_password(password: str) -> str:
    salt = secrets.token_hex(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), PBKDF2_ITERATIONS
    ).hex()
    return f"{PBKDF2_ALGO}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, salt, digest = stored.split("$")
    except ValueError:
        return False
    if algo != PBKDF2_ALGO:
        return False
    computed = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), PBKDF2_ITERATIONS
    ).hex()
    # Constant-time compare so timing can't leak the hash.
    return hmac.compare_digest(computed, digest)


def _sign(payload: str) -> str:
    return hmac.new(_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()


def issue_token(user_id: int) -> str:
    """A signed, expiring token: user_id.expiry.signature (no server-side storage)."""
    expiry = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{user_id}.{expiry}"
    return f"{payload}.{_sign(payload)}"


def verify_token(token: str) -> int | None:
    try:
        user_id, expiry, signature = token.split(".")
        payload = f"{user_id}.{expiry}"
    except ValueError:
        return None
    if not hmac.compare_digest(signature, _sign(payload)):
        return None
    if int(expiry) < time.time():
        return None
    return int(user_id)

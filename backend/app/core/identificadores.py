import secrets


def nuevo_id() -> str:
    return secrets.token_hex(10)

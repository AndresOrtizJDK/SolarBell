FROM docker.io/library/python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/opt/venv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM docker.io/library/python:3.13-slim AS runtime
RUN useradd --create-home --uid 1000 app
ENV PATH=/opt/venv/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
COPY --from=build /opt/venv /opt/venv
WORKDIR /app
COPY --chown=app:app alembic.ini ./
COPY --chown=app:app alembic ./alembic
COPY --chown=app:app app ./app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4)"]
# 1 worker: el hub de WebSocket y el programador viven en memoria.
# --proxy-headers --forwarded-allow-ips='*': este contenedor no publica puerto;
# solo lo alcanza nginx. Sin el comodín, uvicorn solo confía en 127.0.0.1 y
# request.client queda con la IP interna de nginx. El comodín es seguro aquí
# porque el único cliente es ese nginx, que fija X-Forwarded-For a la IP real
# (CF-Connecting-IP si hay Cloudflare). Las comillas evitan que el shell
# expanda el asterisco.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.principal:app --host 0.0.0.0 --port 8000 --workers 1 --proxy-headers --forwarded-allow-ips='*'"]

FROM python:3.12-slim

# Install build-essential for g++ and other build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install uv and make sure it is on PATH
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

# Copy the application source
COPY . .

RUN uv sync

# Expose the LangGraph server port
EXPOSE 2024

# Run langgraph dev server using uv run to execute in the venv
# --host 0.0.0.0 allows external connections in Docker
CMD ["uv", "run", "langgraph", "dev", "--allow-blocking", "--host", "0.0.0.0", "--port", "2024"]


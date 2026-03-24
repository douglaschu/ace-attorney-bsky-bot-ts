FROM python:3.10-slim-bookworm

# System dependencies (from engine's Dockerfile + Node.js)
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 g++ pkg-config libicu-dev curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies first (cached layer unless requirements.txt changes)
COPY render_bridge/requirements.txt render_bridge/requirements.txt
RUN pip install --no-cache-dir -r render_bridge/requirements.txt && \
    python -m spacy download en_core_web_sm

# Node dependencies (cached layer unless package.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Build TypeScript
RUN npm run build

CMD ["node", "dist/bot/index.js"]
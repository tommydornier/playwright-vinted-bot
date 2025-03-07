FROM mcr.microsoft.com/playwright:v1.51.0-jammy

WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit

COPY . .
CMD ["node", "index.js"]

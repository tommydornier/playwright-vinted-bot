FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit

COPY . .
CMD ["node", "index.js"]

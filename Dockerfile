FROM mcr.microsoft.com/playwright:v1.43.0

WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit

COPY . .
CMD ["node", "index.js"]

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY src/ ./src/

EXPOSE 3000

COPY start.sh ./
RUN chmod +x start.sh
CMD ["./start.sh"]
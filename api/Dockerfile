FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Create uploads directory
RUN mkdir -p Assets/uploads

EXPOSE 3000

CMD ["node", "index.js"]

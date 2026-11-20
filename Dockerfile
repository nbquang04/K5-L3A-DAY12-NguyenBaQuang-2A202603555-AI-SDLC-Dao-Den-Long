FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32
WORKDIR /game
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY scripts ./scripts
COPY tests ./tests
COPY index.html game.contract.json ./
RUN npm test && npm run build
EXPOSE 4173
CMD ["npm", "start"]

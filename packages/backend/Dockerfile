FROM node:20

WORKDIR /app

# COPY package.json yarn.lock ./

COPY . .

RUN yarn install --frozen-lockfile

CMD ["yarn", "workspace", "backend", "dev"]

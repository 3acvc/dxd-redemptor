
FROM node:18 AS base
# install python3 and pip3
RUN apt-get update && apt-get install -y python

RUN npm i -g turbo

WORKDIR /app
COPY . .
RUN turbo prune --scope="dxd-redemptor-contracts" --docker

FROM node:18 AS installer
RUN apt-get update && apt-get install -y python
WORKDIR /app
COPY --from=base /app/out/json/ /app/out/pnpm-lock.yaml ./
RUN npm i -g pnpm
RUN pnpm i
COPY --from=base /app/out/full/ ./

FROM ghcr.io/foundry-rs/foundry AS foundry
WORKDIR /app
COPY foundry.toml .gitmodules remappings.txt ./
COPY --from=installer /app/packages/contracts /app/packages/contracts
RUN forge install --no-git
RUN forge build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=installer /app .
COPY --from=foundry /app/packages/contracts/out ./packages/contracts/out

ENV FORK_RPC_ENDPOINT=
ENV DOCKER=true

EXPOSE 8545

CMD node ./packages/contracts/fork/start.js $FORK_RPC_ENDPOINT
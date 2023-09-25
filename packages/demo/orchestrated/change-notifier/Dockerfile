FROM node:lts

RUN npm install -g pnpm 

WORKDIR /src
# We assume that the context root is the 
# project folder. This includes
# the pnpm workspace config, so that 
# all dev-time refs should work.
COPY . ./
RUN pnpm i

WORKDIR /src/packages/demo/orchestrated/change-notifier

EXPOSE 80

CMD ["pnpm", "start"]

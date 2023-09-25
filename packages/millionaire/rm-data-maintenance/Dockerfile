FROM node:lts

RUN npm install -g pnpm 

WORKDIR /src
# We assume that the context root is the 
# project folder. This includes
# the pnpm workspace config, so that 
# all dev-time refs should work.
COPY . ./
RUN pnpm i

WORKDIR /src/packages/millionaire/rm-data-maintenance

EXPOSE 80

CMD ["/src/wait-for-it.sh", "-t", "0", "mongo:27017", "--", "/src/wait-for-it.sh", "-t", "0", "redis:6379", "--", "pnpm", "start"]

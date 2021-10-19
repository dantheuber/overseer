FROM node:14 AS lib
WORKDIR /src/lib
ADD ./functions/lib ./

FROM node:14 AS lambda-build
RUN apt-get update && apt-get install -y zip && apt-get clean
WORKDIR /src/functions
ADD ./package*.json ./
RUN npm install

FROM lambda-build as check-site
ADD ./functions/check-site .
RUN npm prune --only=prod

# CDK Infrastructure build
FROM node:14 AS cdk
RUN npm install -g aws-cdk

FROM cdk AS deploy
WORKDIR /cdk
ADD ./package*.json ./
RUN npm install ./

COPY --from=check-site /src/functions/ /cdk/functions/check-site/
COPY --from=lib /src/lib /cdk/functions/check-site/lib/

ADD ./infrastructure/ ./infrastructure/
ADD ./cdk.json .
ENTRYPOINT [ "cdk" ]
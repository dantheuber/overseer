# Lambda's
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

FROM lambda-build as alert-down
ADD ./functions/alert-down .
RUN npm prune --only=prod

FROM lambda-build as populate-queue
ADD ./functions/populate-checkup-queue .
RUN npm prune --only=prod

FROM lambda-build as api-routes
ADD ./functions/api-routes .
RUN npm prune --only=prod

# Dashboard
FROM node:14 AS dashboard-build
WORKDIR /src
ADD ./dashboard .
RUN yarn
RUN yarn build

# CDK Infrastructure build
FROM node:14 AS cdk
RUN npm install -g aws-cdk

FROM cdk AS deploy
WORKDIR /cdk
ADD ./package*.json ./
RUN npm install ./

COPY --from=check-site /src/functions/ /cdk/functions/check-site/
COPY --from=lib /src/lib /cdk/functions/check-site/lib/
COPY --from=alert-down /src/functions/ /cdk/functions/alert-down/
COPY --from=lib /src/lib /cdk/functions/alert-down/lib/
COPY --from=populate-queue /src/functions/ /cdk/functions/populate-checkup-queue
COPY --from=lib /src/lib /cdk/functions/populate-checkup-queue/lib/
COPY --from=api-routes /src/functions/ /cdk/functions/api-routes/
COPY --from=lib /src/lib /cdk/functions/api-routes/lib/

COPY --from=dashboard-build /src/build/ /cdk/dashboard/

ADD ./infrastructure/ ./infrastructure/
ADD ./cdk.json .
ADD ./.env .
ENTRYPOINT [ "cdk" ]
#!/bin/bash

docker-compose build
docker-compose run cdk deploy --all
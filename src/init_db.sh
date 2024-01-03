#!/bin/bash

# npm run migrate-db
npx sequelize db:create
npx sequelize db:migrate
npm run start
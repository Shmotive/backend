#!/bin/bash

# npm run migrate-db
npx prisma migrate reset --force
npm run start
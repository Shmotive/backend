# Welcome to the Motive backend repository!

This repository contains the backend services for the **Motive** platform. The backend is built with **Node.js**, **Express**, **Apollo Server**, and **Prisma**. It facilitates both WebSocket and HTTPS communication with the frontend through **GraphQL**. The backend is responsible for core logic, data management, and real-time updates.


## Architecture Overview

### 1. **API and WebSocket Layer (GraphQL)**
   The backend communicates with the frontend using **Apollo Server**, which serves both HTTP and WebSocket (WSS) protocols through GraphQL.

   - **GraphQL API**: Built on Apollo Server, this API handles all incoming HTTP requests from the frontend and resolves them using GraphQL queries and mutations.
   - **WebSocket (WSS)**: Apollo Server also facilitates real-time features using WebSockets for use cases like live updates on activities, votes, and lobby status, which we make use of with subscriptions.
   
### 2. **Database (Postgres)**
   The backend uses **Prisma** as the ORM to interact with a **Postgres** database. Prisma provides an abstraction layer over Postgres, enabling type-safe queries and migrations.

   - **Postgres**: Relational database used to store user data, activities, and other core entities.
   - **Prisma ORM**: Facilitates database interactions with type-safe queries, migrations, and schema management.
   - **PostGIS**: Although PostGIS is installed and integrated with Postgres for geospatial operations, such as efficient querying of existing lat/lng coordinates, it is currently **not actively used** in this version of the platform.

### 4. **Security**
   Security is a high priority in the backend architecture, with the following measures in place:
   - **Data Encryption**: Sensitive data is encrypted before being stored in the database.
   - **CORS**: Cross-Origin Resource Sharing (CORS) is enabled to secure the API and allow safe communication between the frontend and backend.

### 5. **Deployment**
   The backend is deployed using **PM2** for process management and is hosted on a self-hosted server (AWS EC2). 

   - **PM2**: Manages application processes, ensuring automatic restarts, load balancing, and zero-downtime deployments.
   - **GitHub Actions**: Automates testing, building, and deployment to the target infrastructure.

### 6. **Docker**
   Dockerizing allows for consistent app behaviour across platforms, and makes scaling more efficient.
   The Dockerfile at top level of the repository indicates our setup for this.

## Running Locally

If you want to try running this setup locally, follow these steps:
**Prerequisites:** Have Docker installed on your machine; Make sure port 4000 on your machine is exposed; You'll need a Google API key with access to Places and Maps API enabled; npm and node.js
- `clone` the repository to your local machine using whichever method you prefer
- Navigate to the `/src` directory and run `npm install` in the console
- create a `.env` file with the following variables:
        DATABASE_URL="postgresql://postgres:postgres@motive-postgres:5432/database_test?schema=postgres"
        ENV_TYPE="dev"
        GOOGLE_KEY= insert your Google API key here
- in the `/src` directory, run either `docker compose up` or `sudo docker compose up`
       - if you're getting errors here, try a `dos2unix` command and then re-run
- the environment should be up on your 4000 port! access it at localhost:4000/graphql on a browser
- if you need to reset the environment for any reason, kill the process, and then run any of the `restart.sh`-s

  The Apollo backend API is accessible at [api.whatsthemotive.app](api.whatsthemotive.app), and motive itself can be found at [whatsthemotive.app](https://whatsthemotive.app)

  The frontend repo can also be found in this organization's repositories on Github.

  Last Edited: Sep 2024

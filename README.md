# Project Setup Instructions

This document provides the necessary steps to set up and run the backend and frontend of the project.

## Backend Setup

1. **Install Dependencies:**
   Navigate to the backend directory and install the required packages:

   ```bash
   cd backend
   sudo npm install
   ```

2. **Environment Configuration:**
   Create a `config.env` file in the root of the backend directory with the following contents:

   ```env
   NODE_ENV=
   PORT=
   DATABASE=
   JWT_SECRET=
   JWT_EXPIRES_IN=
   ```

   Replace the placeholders with your specific environment values.

3. **Mock Data Management:**
   The database comes pre-populated with sample data to help you get started. If you need to reset the database to its initial state with the mock data or clear it entirely, you can use the following npm scripts:

   - To **delete existing data** and start with a clean database, run:
     ```bash
     npm run deleteData
     ```
   - To **re-import the mock data** after cleaning the database, run:
     ```bash
     npm run importData
     ```

   These commands are defined in your `package.json` and can be located under the `scripts` section:

   ```json
   "scripts": {
     "importData": "node ./dev-data/data/import-dev-data.js --import",
     "deleteData": "node ./dev-data/data/import-dev-data.js --delete"
   }
   ```

   If you imported the data, all user passwords in `dev-data/data/users.json` are set to `Prueb@123`.

4. **Start the Backend:**
   To start the backend server in production mode, run:

   ```bash
   npm run start:prod
   ```

   In the `./backend` directory, you'll find `Licify.postman_collection.json`, which can be used for testing the backend with Postman. The Postman collection documentation can be accessed at [Licify Postman Collection](https://documenter.getpostman.com/view/26744671/2s9YsGjDgq).

## Frontend Setup

1. **Install Dependencies:**
   Navigate to the frontend directory and install the required packages:

   ```bash
   cd ../frontend
   sudo npm install
   ```

2. **Run the Frontend:**
   Start the Angular server:
   ```bash
   ng serve
   ```

## Running with Docker

To run the project using Docker, make sure you have Docker and Docker Compose installed on your system. Then, in the root directory of the project, provided you already created the `config.env` file in the root of the backend directory, run:

```bash
docker compose up
```

Once the services are up and running, open your browser and go to [127.0.0.1](http://127.0.0.1) to start using the app.

## Enjoy

Navigate to the appropriate URL in your browser to use the application.

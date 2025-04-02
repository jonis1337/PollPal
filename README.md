# PollPal
PollPal is a simple, web-based app that lets users sign in or create an account, vote on polls with a simple Yes or No, and view the results after voting. Users can also create and delete polls with ease in a clean interface. Additionally, users can change their username.

Visit https://pollpalvoter.web.app/ to try it out or follow usage if you want to spin it up locally.

## Usage

1. Load the `database_setup.sql` into your database (you have to remove the old tables for this to work).
    - Connect to your PostgreSQL database using `psql`.
    - Run the command: 
      ```bash
      \i database_setup.sql
      ```
2. Navigate to the folder `pollpal_backend`.
3. Create a `.env` file in that folder.
    - Edit it so it contains:
      ```plaintext
      DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}
      ```
4. Install backend dependencies.
    - Run the following command in the `pollpal_backend` folder:
      ```bash
      npm install
      ```
5. Build the frontend.
    - Navigate to the frontend folder:
      ```bash
      cd pollpal_frontend
      ```
    - Install dependencies and build the project:
      ```bash
      npm install
      npm run build
      ```
    - Move the generated `dist` folder to the backend folder:
      ```bash
      mv dist ../pollpal_backend/
      ```
6. Run the backend server.
    - Navigate back to the backend folder:
      ```bash
      cd ../pollpal_backend
      ```
    - Start the server:
      ```bash
      node server.js
      ```
7. Open the browser and enter `localhost:portnumber` (you will see the port in the terminal).

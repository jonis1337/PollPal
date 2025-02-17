# PollPal
PollPal is a simple, web-based app that lets users sign in or create an account, vote on polls with a simple Yes or No, and view the results after voting. Users can also create and delete polls with ease in a clean interface. Additionally, users can change their username.
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
      DATABASE_URL=postgres://DATABASE_USERNAME:DATABASE_PASSWORD@postgres.cs.umu.se:PORT/DATABASE_NAME
      ```
4. Run the command:
    ```bash
    node server.js
    ```
5. Open the browser and enter `localhost:portnumber` (you will see the port in the terminal).

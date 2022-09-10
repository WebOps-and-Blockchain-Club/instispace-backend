# Backend for InstiSpace App

An graphql API for InstiSpace App

# Setup

1. Download the [PostgreSQL](https://www.postgresql.org/)
2. Create a Database
3. Add these variables in `.env` file
   1. `DATABASE_URL` - Postgres url to connect with database
   2. `NODE_ENV` - `development` or `production`
   3. `JWT_SECRET` - Secret key to generate json web token
   4. `SERVER` - Url of the backend
   5. `ITERATIONS` - Number of iterations for hasing the password using bcrypt.js
   6. `CLIENT_ID` - Configuration for gmail api
   7. `CLIENT_SECRET` - Configuration for gmail api
   8. `REDIRECT_URI` - Configuration for gmail api
   9. `REFRESH_TOKEN` - Configuration for gmail api
   10. `SERVER_KEY` - Server key to use FCM(Firebase cloud messaging)
   11. `LDAP_USERNAME` - CFI Ldap username to access IITM LDAP server
   12. `LDAP_PASSWORD` - CFI Ldap password to access IITM LDAP server
   13. `API_KEY` - Server key to access this api
4. To install the packages, run `yarn install`
5. To start the server in development mode, run `yarn dev`
6. To start the server in production mode, run `yarn build` and `yarn start`

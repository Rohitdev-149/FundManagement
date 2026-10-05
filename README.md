# FundManagement
A secure and responsive Fund Management System for managing members, contributions, expenses, events, and financial records with OTP-based email authentication and role-based access control.

## Local development

Run the API and client from separate terminals:

```powershell
cd server
npm install
npm run dev
```

```powershell
cd client
npm install
npm run dev -- --host
```

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in the database, JWT, and mail settings. Never commit either `.env` file.

## Deployment

Deploy `client` as a Vite app on Vercel:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://fundmanagement-6nu7.onrender.com/api`

Deploy `server` as a Node web service on Render:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Set these Render environment variables:

```text
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<long random secret>
PORT=10000
CORS_ORIGIN=https://fund-management-kappa.vercel.app
CLIENT_URL=https://fund-management-kappa.vercel.app
```

Add any additional trusted frontend origins to `CORS_ORIGIN`, separated by commas. Render does not use the local `server/.env` file.

## CORS configuration

The API allows only origins listed under `CORS_ORIGIN`. When using the Vite client from another machine, add its exact origin, including the port, for example `http://10.45.66.199:5173`.

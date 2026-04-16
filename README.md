# Aamira Courier Package Tracker — Backend Server

A robust REST API and real-time backend server for the **Aamira Courier Package Tracker** system, built with Node.js, Express, MongoDB, and Socket.IO.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express v5
- **Database:** MongoDB via Mongoose
- **Real-time:** Socket.IO
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Dev Tool:** Nodemon

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   git clone <your-repo-url>
   cd aamira-tracker-server

2. Install dependencies:
   npm install

3. Create a `.env` file in the root directory:
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/aamira_tracker
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000

### Running the Server

Development mode (auto-restart on changes):
   npm run dev

Production mode:
   npm start

## Project Structure

aamira-tracker-server/
├── index.js              # Entry point
├── .env                  # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md

## Features

- User registration and login with hashed passwords (bcryptjs)
- JWT-based authentication and route protection
- Package creation, tracking, and status updates
- Real-time package status updates via Socket.IO
- Cross-origin support with CORS
- MongoDB data persistence via Mongoose

## API Overview

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| POST   | /api/auth/register    | Register a new user          |
| POST   | /api/auth/login       | Login and receive JWT        |
| GET    | /api/packages         | Get all packages             |
| POST   | /api/packages         | Create a new package         |
| GET    | /api/packages/:id     | Get a package by ID          |
| PUT    | /api/packages/:id     | Update package status        |
| DELETE | /api/packages/:id     | Delete a package             |

> Update the table above to match your actual implemented routes.

## Real-time Events (Socket.IO)

| Event               | Direction         | Description                        |
|---------------------|-------------------|------------------------------------|
| package:updated     | Server → Client   | Emitted when a package is updated  |
| package:created     | Server → Client   | Emitted when a new package is added|
| join:room           | Client → Server   | Client joins a tracking room       |

> Update events to match your actual Socket.IO implementation.

## Environment Variables

| Variable    | Description                        | Example                          |
|-------------|------------------------------------|----------------------------------|
| PORT        | Port the server runs on            | 5000                             |
| MONGO_URI   | MongoDB connection string          | mongodb://localhost:27017/aamira |
| JWT_SECRET  | Secret key for signing JWTs        | supersecretkey                   |
| CLIENT_URL  | Allowed frontend origin for CORS   | http://localhost:3000            |

## Security Notes

- Passwords are hashed using bcryptjs before storage
- JWTs are used for stateless authentication
- CORS is configured to allow only trusted origins
- Never commit your `.env` file — add it to `.gitignore`

## License

ISC
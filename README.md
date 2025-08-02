# Digital Wallet Backend

This is the backend for a Digital Wallet system, developed with Node.js, Express.js, and MongoDB. It provides a secure and efficient way to manage users, agents, wallets, and transactions.

## Features

*   **User Management:** User registration, login, and profile management.
*   **Agent Management:** Agent creation and management.
*   **Wallet Management:** Create and manage wallets for users.
*   **Transactions:** Securely transfer funds between wallets.
*   **Authentication:** JWT-based authentication for secure access to routes.
*   **Authorization:** Role-based access control for different user types (user, agent, admin).
*   **Error Handling:** Centralized error handling for robust API responses.
*   **Validation:** Request validation using Zod.

## API Endpoints


==============================================
📋 ROUTE STRUCTURE SUMMARY
==============================================

🔐 Authentication Routes (/api/auth)
POST   /register     - Register new user/agent
POST   /login        - Login user/agent/admin
POST   /logout       - Logout user
GET    /me          - Get current user profile
PUT    /change-password - Change password


💰 Wallet Routes (/api/wallets) [Auth Required - User/Agent]
GET    /balance     - Get wallet balance
POST   /add-money   - Add money to wallet
POST   /cash-out    - Cash out money from wallet
POST   /send-money  - Send money to another user


🏪 Agent Routes (/api/agent) [Auth Required - Agent Only]
POST   /cash-in     - Agent cash-in to user wallet
POST   /cash-out    - Agent cash-out from user wallet
GET    /commission-history - Get commission history


🔁 Transaction Routes (/api/transactions) [Auth Required]
GET    /            - Get transaction history
GET    /:transactionId - Get transaction details


👑 Admin Routes (/api/admin) [Auth Required - Admin Only]
GET    /users       - Get all users
GET    /wallets     - Get all wallets
PATCH  /wallets/:id/block - Block/unblock wallet
GET    /wallets/:id - Get wallet details
GET    /agents      - Get all agents
PATCH  /agents/:id/approve - Approve/suspend agent
GET    /transactions - Get all transactions


## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v14 or later)
*   [MongoDB](https://www.mongodb.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Ashik-Ahmed/l2-b5-assignment-5-digital-wallet-backend.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd l2-b5-assignment-5-digital-wallet-backend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
PORT=5000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration_time
BCRYPT_SALT_ROUNDS=your_bcrypt_salt_rounds
```

### Running the Application

To run the application in development mode with auto-reloading, use the following command:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default is 5000).

## Scripts

*   `npm run dev`: Starts the development server with ts-node-dev.
*   `npm run lint`: Lints the project files using ESLint.
*   `npm test`: (Not yet implemented)

## Technologies Used

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web framework for Node.js.
*   **MongoDB:** NoSQL database.
*   **Mongoose:** ODM for MongoDB.
*   **TypeScript:** Superset of JavaScript that adds static typing.
*   **JWT (JSON Web Tokens):** For secure authentication.
*   **Zod:** For data validation.
*   **ESLint:** For code linting.

## Project Structure

The project follows a modular structure, with each feature (user, auth, wallet, etc.) having its own dedicated module containing its controller, service, route, and validation files.

```
src/
├── app/
│   ├── config/
│   ├── errorHelpers/
│   ├── middlewares/
│   ├── modules/
│   │   ├── user/
│   │   ├── auth/
│   │   └── ...
│   ├── routes/
│   └── utils/
├── app.ts
└── server.ts
```



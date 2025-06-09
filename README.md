# Jumper Challenge - Fullstack Project

This project is a **monorepo** containing two packages:

- **backend**
- **frontend**

The project implements a fullstack authentication flow using **Sign-In With Ethereum (SIWE)** + ERC20 balances fetching + Leaderboard.

## Local Setup

### Environment Variables

First, you need to create the `.env` file from the provided example:

```bash
cp .env.example .env
```

The most important environment variables you need to set are:

- `ALCHEMY_API_KEY` (required to query balances from [Alchemy](https://auth.alchemy.com/login))
- `MORALIS_API_KEY` ([Moralis](https://admin.moralis.com/register) is used as fallback if Alchemy fails)

### Install dependencies

From the root directory:

```bash
yarn install
```

### Running the project

You can run both frontend and backend separately using Yarn workspaces.

#### Frontend

```bash
yarn workspace frontend dev
```

- The frontend will run at: [http://localhost:5173/](http://localhost:5173/)

#### Backend

```bash
yarn workspace backend dev
```

- The backend will run at: [http://localhost:4000/](http://localhost:4000/)

#### Alternatively, using Docker:

You can also run everything using Docker Compose:

```bash
docker-compose build
docker-compose up
```

### Running tests

You can run tests for both frontend and backend:

```bash
yarn test
```

---

## Backend

The backend is written in **Node.js** using **Fastify**.

### Endpoints

Currently, there are 3 main endpoints implemented:

- **`GET /auth/nonce/:address`**
  Returns a nonce signed by the backend for the provided address. This nonce must be included in the SIWE message that the frontend will later sign.

- **`POST /auth/session`**\*\* (Sign In)\*\*
  Validates that both the nonce and the signature are correct.
  If valid, it creates a session by issuing a JWT token that is returned inside a secure HTTP-only cookie. The authentication system is **stateless** — the backend does not need to store any user info.

- **`GET /balances`**
  Returns the ERC20 balances for a connected user.
  The backend uses **Alchemy** as primary provider, and automatically falls back to **Moralis** if Alchemy fails.

### Architecture

The backend follows a layered architecture:

- **Controller Layer:** Handles HTTP requests and responses. It only communicates with the service layer.
- **Service Layer:** Contains the business logic of the application. Completely decoupled from HTTP concerns.
- Each layer is fully separated and has its own responsibility.

### Tests

- The backend contains full integration tests with very high test coverage.

---

## Frontend

The frontend is built with **Vite**, using **React** and **TypeScript**.

### Main Technologies:

- **Material UI (MUI):** for UI components.
- **Context API:** for state management.
- **Axios:** for HTTP requests.
- **Tanstack React Query:** for query caching and loading/error states (in some flows).
- **Wagmi + RainbowKit:** to handle wallet connections and signing.
- **siwe package:** used to generate the SIWE message that the user signs for authentication.

### UI Note

The styles are simple and functional. The focus is not on fancy design but rather on fully functional and clean UI behavior.

---

## Summary

This project includes:

- A complete fullstack authentication flow using **Sign-In With Ethereum (SIWE)**.
- Secure backend authentication using stateless JWT sessions stored in cookies.
- ERC20 token balances fetching with multiple data providers.
- Full test coverage in the backend.
- Functional and clean frontend architecture.

---

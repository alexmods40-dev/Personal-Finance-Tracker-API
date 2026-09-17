# Personal Finance Tracker API

A RESTful API for personal expense tracking built with TypeScript, Express, and Prisma ORM. It supports user authentication via JWT, category limit tracking, transaction filtering, and expense statistics.

## Features

- **Authentication:** JWT access tokens and hashed refresh tokens stored in HTTP-only cookies.
- **Category Management:** Custom categories with monthly spending limits.
- **Transaction Tracking:** Income and expense logging with automatic warnings if a category limit is exceeded.
- **Analytics:** Balance calculation and monthly expense breakdowns.
- **Validation & Security:** Request body validation using Zod schemas, password hashing with bcrypt, and rate-limiting.

## Tech Stack

| Category | Technologies |
|---|---|
| Language | TypeScript |
| Backend | Node.js, Express |
| Database & ORM | PostgreSQL, Prisma ORM |
| Auth & Security | JWT, bcrypt, express-rate-limit, cookie-parser |
| Validation | Zod |

## Setup and Run

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/alexmods40-dev/Personal-Finance-Tracker-API.git
   cd finance-tracker-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/finance_db?schema=public"
   ACCESS_TOKEN=your_access_token_secret
   REFRESH_TOKEN=your_refresh_token_secret
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the application:

   ```bash
   # Development mode
   npm run dev

   # Production build & start
   npm run build
   npm start
   ```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive tokens |
| GET | `/refresh` | Refresh access token using cookie |

### Protected Routes (requires JWT header)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/balance` | Calculate current total balance |
| GET | `/stats` | Monthly expense breakdown for the current year |
| GET | `/category` | Get user categories |
| POST | `/category` | Create a new category with a monthly limit |
| DELETE | `/category/:id` | Delete a category |
| GET | `/transactions` | Fetch transactions filtered by date (`?from=YYYY-MM-DD&to=YYYY-MM-DD`) |
| POST | `/transactions` | Add an income or expense transaction |
| DELETE | `/transactions/:id` | Delete a transaction |

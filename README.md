
# Daily Expenses Sharing Application

A simple full-stack application that helps users manage, split, and track shared expenses. Built with MongoDB, Express, and JavaScript, it supports user registration, flexible expense splitting, and a balance sheet view to simplify financial tracking within groups.

## Features

- **User Authentication**: Secure login and registration with JWT-based authentication.
- **Expense Management**: Add expenses and split them equally, by percentage, or by exact amounts.
- **Balance Sheet Generation**: View and track the balance sheet, showing each user’s expenses and splits.

## Project Structure

- **Backend**: Uses Node.js and Express for API management.
- **Database**: MongoDB for persistent storage of user and expense data.

## Endpoints

1. **User Management**
   - `POST /register` – Register a new user.
   - `POST /login` – User login and token generation.

2. **Expense Management**
   - `POST /expense/add` – Add a new expense with split details.
   - `GET /balance` – View the balance sheet with breakdowns for each user.

## Getting Started

### Prerequisites
- Install [Node.js](https://nodejs.org/)
- Install [MongoDB](https://www.mongodb.com/)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/expenses-sharing-app.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Usage
- Use Postman to test the endpoints.
- For endpoints requiring authorization, include a JWT token in the Authorization header as a Bearer Token.

### Example Token Usage
In Postman, under the **Authorization** tab, select **Bearer Token** and paste the JWT token generated upon login.


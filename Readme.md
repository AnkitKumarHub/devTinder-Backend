# DevTinder Backend

This is the backend API for DevTinder, a developer matchmaking platform. It is built with Node.js, Express, MongoDB, and supports real-time chat, user authentication, connection requests, and premium membership via Razorpay.

## Features

- User authentication (signup, login, logout)
- Profile management (view, edit, change password)
- Feed API with pagination
- Connection requests (send, review, accept, reject)
- Real-time chat using Socket.io
- Premium membership with Razorpay integration
- Daily email reminders for pending requests

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas or local MongoDB instance
- [Razorpay](https://razorpay.com/) account for payment integration

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/devTinder-Backend.git
   cd devTinder-Backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   DB_CONNECTION_SECRET=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   TEST_KEY_ID=your_razorpay_key_id
   TEST_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   MAIL_SECRET=your_gmail_app_password
   PORT=7777
   ```

4. Start the server:
   ```sh
   npm run dev
   ```

## API Documentation

See [apiList.md](apiList.md) for a list of available endpoints.

## Deployment

- The backend is deployed at: `https://your-backend-url.com`
- Make sure to update CORS origins in `app.js` as per your frontend deployment.

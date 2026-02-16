# Document Summary Backend

Backend API for the Document Summary application with user authentication and summary history.

## Features
- User registration and login with JWT authentication
- Password hashing with bcrypt
- User-specific summary history storage
- Protected API endpoints

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/document-summary
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

### 3. Install and Start MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Summaries (Protected - Requires JWT Token)
- `POST /api/summaries` - Save new summary
  ```json
  {
    "fileName": "document.pdf",
    "fileType": "pdf",
    "summary": "Executive summary text...",
    "keyPoints": ["Point 1", "Point 2"]
  }
  ```

- `GET /api/summaries` - Get user's summary history

- `DELETE /api/summaries/:id` - Delete a summary

### Health Check
- `GET /api/health` - Check server status

## Authentication
Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer <your-jwt-token>
```

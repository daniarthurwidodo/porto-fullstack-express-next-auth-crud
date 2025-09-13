# Backend API - Express + Sequelize + JWT + TypeScript

A robust backend API built with Express.js, Sequelize ORM, JWT authentication, and TypeScript.

## Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript development
- **Sequelize** - Promise-based ORM for PostgreSQL
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **CORS** - Cross-origin resource sharing enabled
- **Security** - Helmet.js for security headers
- **Logging** - Morgan for HTTP request logging
- **Error Handling** - Centralized error handling middleware

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

1. Create a PostgreSQL database
2. Update the database configuration in your `.env` file
3. The application will automatically create tables when you start the server

### Docker Setup (Recommended)

Use Docker Compose to run PostgreSQL locally:

```bash
# Start PostgreSQL container
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs postgres
```

### Seeding Test Data

The project includes a seeder script to populate your database with 25 test users:

```bash
npm run seed
```

**Test User Credentials:**
- **Email Format**: `[firstname.lastname]@example.com`
- **Password**: `password123` (for ALL users)
- **Examples**:
  - `john.doe@example.com` / `password123`
  - `jane.smith@example.com` / `password123`
  - `michael.johnson@example.com` / `password123`
  - ... and 22 more users

**Important Notes:**
- All 25 users share the same password: `password123`
- The seeder prevents duplicates - safe to run multiple times
- Users are created with realistic names and proper bcrypt password hashing
- All users are active by default

You can use any of these accounts to test authentication endpoints in Postman or your frontend application.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### User Routes (`/api/users`)

- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/password` - Update user password (protected)
- `DELETE /api/users/account` - Deactivate user account (protected)

### Health Check

- `GET /api/health` - Server health check

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```bash
Authorization: Bearer your_jwt_token_here
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.ts     # Error handling middleware
│   ├── models/
│   │   └── User.ts              # User model
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   └── users.ts             # User CRUD routes
│   └── index.ts                 # Application entry point
├── dist/                        # Compiled JavaScript (generated)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Security headers with Helmet
- Input validation
- SQL injection prevention (Sequelize ORM)

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Generic server errors

All errors return a consistent JSON format:
```json
{
  "error": "Error message description"
}
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation as needed

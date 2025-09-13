# Porto - Full Stack Authentication & User Management System

A modern full-stack application built with **Next.js 14**, **Express.js**, **TypeScript**, and **PostgreSQL** featuring JWT authentication and complete user management with admin dashboard.

## 🚀 Features

### Frontend (Next.js 14)
- **Authentication System** - JWT-based login/register with protected routes
- **Admin Dashboard** - Modern sidebar navigation with user management
- **User Management** - Complete CRUD operations with search and filtering
- **Modal Forms** - Add/edit users with validation
- **Responsive Design** - Monochromatic deep gray theme with Tailwind CSS
- **TypeScript** - Full type safety throughout the application
- **Testing Suite** - Jest + React Testing Library with comprehensive test coverage

### Backend (Express.js)
- **RESTful API** - Complete user management endpoints
- **JWT Authentication** - Secure token-based authentication
- **PostgreSQL Database** - Sequelize ORM with migrations and seeders
- **Security** - CORS, Helmet, bcrypt password hashing
- **Validation** - Input validation and error handling
- **Testing Suite** - Jest + Supertest with unit and integration tests

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v15 or higher)
- **Docker** (optional, for database setup)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd porto-fullstack-express-next-auth-crud
```

### 2. Database Setup (Option A: Docker - Recommended)
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# This creates:
# - PostgreSQL database on port 5432
# - Adminer web interface on port 8080
# - Database: porto_db
# - User: porto_user
# - Password: porto_password
```

### 2. Database Setup (Option B: Local PostgreSQL)
```bash
# Create database and user manually
createdb porto_db
createuser porto_user
# Set password and grant permissions as needed
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env file with your database credentials if needed
# Default values work with Docker setup

# Run database migrations
npm run migrate

# Seed the database with test users
npm run seed

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:4001`

### 4. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:3001`

## 🔑 Test Credentials

The application comes with 25 pre-seeded test users. You can login with any of these accounts:

**Format:** `[firstname.lastname]@example.com`  
**Password:** `password123` (for all users)

### Example Test Users:
- `john.doe@example.com` / `password123`
- `jane.smith@example.com` / `password123`
- `alice.johnson@example.com` / `password123`
- `bob.williams@example.com` / `password123`

## 🌐 Application URLs

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:4001
- **Database Admin (Adminer):** http://localhost:8080 (if using Docker)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### User Management (Protected Routes)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Deactivate own account

## 🎯 Usage

1. **Start the application** following the installation steps above
2. **Visit** http://localhost:3001
3. **Login** with any test user credentials
4. **Explore** the admin dashboard and user management features

### Admin Dashboard Features:
- **Dashboard Overview** - System statistics and status
- **User Management** - View, search, filter, add, edit, and delete users
- **Search & Filter** - Find users by name/email, filter by active/inactive status
- **Modal Forms** - Add new users or edit existing ones
- **Responsive Design** - Works on desktop and mobile devices

## 🧪 Testing

Both the backend and frontend include comprehensive test suites to ensure code quality and reliability.

### Backend Testing
The backend uses **Jest** with **Supertest** for unit and integration testing:

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Coverage:**
- Authentication middleware (JWT validation, token expiration)
- User authentication routes (login, register, profile)
- User model (password hashing, validation)
- Database operations and error handling
- **Status:** 27/27 tests passing ✅

### Frontend Testing
The frontend uses **Jest** with **React Testing Library** for component and integration testing:

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Coverage:**
- UI components (Button, Input, Dialog, Modal)
- Authentication context and hooks
- Login page functionality and form validation
- User management components (CRUD operations)
- Error handling and loading states
- **Status:** 31/31 tests passing ✅

## 🔧 Development

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with test users
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🏗️ Project Structure

```
porto-fullstack-express-next-auth-crud/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── __tests__/      # Jest unit tests
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Auth & error handling
│   │   ├── migrations/     # Database migrations
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Utility scripts
│   │   └── seeders/        # Database seeders
│   ├── jest.config.js      # Jest configuration
│   └── package.json
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── __tests__/      # Jest + React Testing Library tests
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and auth context
│   ├── jest.config.js      # Jest configuration
│   ├── jest.setup.js       # Jest setup file
│   └── package.json
├── docker-compose.yml     # PostgreSQL setup
└── README.md
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **CORS Protection** - Configured for development and production
- **Input Validation** - Server-side validation for all endpoints
- **Protected Routes** - Frontend and backend route protection
- **Helmet Security** - Security headers for Express.js

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Beautiful icons

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe development
- **Sequelize** - PostgreSQL ORM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Helmet** - Security middleware

### Database
- **PostgreSQL 15** - Relational database
- **Docker** - Containerized database setup

## 📝 License

This project is licensed under the MIT License.
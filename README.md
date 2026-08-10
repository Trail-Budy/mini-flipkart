# Mini Flipkart

A full-stack e-commerce platform inspired by modern online shopping systems, built as a college project to demonstrate robust architecture, security, and responsive UI design.

## Features

### Customer Features
- Secure Registration and Login with JWT authentication
- Browse Products with category filtering and keyword search
- Shopping Cart management (add, remove, modify quantity)
- Wishlist functionality to save favorite items
- Secure Checkout with real-time server-side stock validation
- Order History and order cancellation (before shipment)
- Account Profile and Address book management

### Seller Features
- Dedicated Seller Dashboard with real-time statistics
- Inventory Management (Add, Edit, Safe-delete products)
- Order Management for products sold by the seller
- Status updates for customer orders (Processing, Shipped, Delivered)
- Secure isolation (Sellers cannot modify other sellers' products)

### Admin Features
- Comprehensive Admin Dashboard with platform-wide statistics
- User Management (View users, update roles dynamically)
- Platform Moderation (Safely delete abusive products/categories)
- Global Order Management and override capabilities
- Strict protection preventing the demotion of the final administrator

## Technology Stack

### Frontend
- React (Component-based UI)
- Vite (Fast development build tool)
- React Router (Client-side routing)
- Context API (Global state management for Auth, Cart, and Toast)
- Vanilla CSS (Custom modern styling without bloated frameworks)
- Lucide React (Icon library)

### Backend
- Node.js & Express.js (RESTful API Server)
- PostgreSQL (Relational Database)
- `pg` (PostgreSQL Client for Node)

### Security Implementations
- **Authentication**: JWT (JSON Web Tokens) stored safely in HTTP-only, secure cookies.
- **Authorization**: Strict Role-Based Access Control (RBAC) via custom middleware.
- **Data Protection**: Passwords hashed using `bcryptjs`.
- **Injection Prevention**: All SQL queries use strictly parameterized inputs (`$1, $2`).
- **Access Control**: Comprehensive IDOR protection on all endpoints.
- **Server Hardening**: HTTP security headers applied via `helmet`.
- **Brute-Force Protection**: IP-based rate limiting via `express-rate-limit`.

## Architecture Flow
```text
React Frontend
 ↓
Express REST API
 ↓
PostgreSQL
```

## Setup Instructions

### 1. Database Setup
You will need a running instance of PostgreSQL (or a cloud provider like Supabase).
Execute the `backend/schema.sql` script in your database to create all required tables.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory using `.env.example` as a template:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_super_secret_jwt_string
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

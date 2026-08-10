# System Architecture

Mini Flipkart is designed as a classic 3-tier web application, separating concerns into a Client (Frontend), a REST API Server (Backend), and a Relational Database.

## High-Level Architecture Flow

```text
[ Frontend Application (React) ]
              ↓
  (HTTP Requests with Secure Cookies)
              ↓
[ Backend Server (Express/Node.js) ]
              ↓
  (Parameterized SQL Queries via 'pg')
              ↓
[ Database (PostgreSQL) ]
```

## Directory Structure

### `frontend/`
The client-side application built with React and Vite.
- `src/components/`: Reusable UI elements (Navbar, ProductCard, ProtectedRoutes).
- `src/pages/`: Main views (Home, Cart, Checkout, SellerDashboard, AdminDashboard).
- `src/context/`: Global state management (`AuthContext`, `CartContext`).
- `src/index.css`: Global styles and design tokens (Vanilla CSS).

### `backend/`
The server-side application built with Node.js and Express.
- `server.js`: Entry point, sets up Express, middleware, CORS, and mounts routes.
- `routes/`: API endpoint definitions (auth, products, cart, orders, seller, admin).
- `middleware/`: Reusable request interceptors (e.g., JWT authentication, RBAC authorization).
- `db.js`: Database connection pool and query helper.
- `schema.sql`: SQL definitions for database tables.

---

## Major Workflows

### Authentication Flow
1. User submits email and password to `POST /api/auth/login`.
2. Backend verifies credentials using `bcrypt`.
3. Backend generates a JWT containing the user ID and role.
4. JWT is sent back to the client as an `httpOnly` secure cookie.
5. All subsequent protected API calls automatically include this cookie.
6. The `authenticate` middleware verifies the cookie and attaches the user payload to `req.user`.

### Product Flow
1. **Customers** browse products via `GET /api/products` (public).
2. **Sellers** create/manage their own products via `/api/seller/products`. The backend strictly enforces `seller_id = req.user.id`.
3. **Admins** can moderate and delete any product via `/api/admin/products`.

### Cart Flow
1. User clicks "Add to Cart" on the frontend.
2. `POST /api/cart` checks the database for an existing cart. If none exists, one is created.
3. The backend checks real-time product stock. If sufficient stock exists, the item is added to `cart_items`.
4. Cart totals are calculated server-side based on database prices to prevent client-side manipulation.

### Checkout & Order Flow
1. User selects a delivery address and submits the order to `POST /api/orders`.
2. Backend initiates a SQL Transaction (`BEGIN`).
3. Backend verifies the cart is not empty and recalculates totals using DB prices.
4. Backend verifies that requested quantities do not exceed available stock.
5. The order is inserted into the `orders` table.
6. Cart items are moved to `order_items`.
7. Product stock is atomically decremented.
8. The cart is cleared.
9. Transaction is committed (`COMMIT`). Any error rolls back all changes (`ROLLBACK`).

### Seller Flow
1. Sellers use the Seller Dashboard to view products and incoming orders.
2. Orders placed by customers for a seller's products appear in the seller's `GET /api/seller/orders`.
3. Sellers can update the order status (Processing, Shipped) via `PATCH /api/seller/orders/:id/status`.

### Admin Flow
1. Admins use the Admin Dashboard to manage the platform.
2. Admins can view platform-wide statistics.
3. Admins can change user roles (e.g., upgrading a customer to a seller) via `PATCH /api/admin/users/:id/role`.
4. Admins are prevented from deleting categories that still have products or demoting the final administrator to prevent platform lock-out.

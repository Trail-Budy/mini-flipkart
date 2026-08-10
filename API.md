# API Documentation

The backend exposes a RESTful JSON API at `http://localhost:5000/api`.

All endpoints that require Authentication expect an `httpOnly` secure cookie containing a valid JWT.

## Authentication Routes

| Method | Endpoint | Auth Required | Purpose | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Creates a new customer account | `{ id, name, email, role }` + Cookie |
| POST | `/api/auth/login` | No | Authenticates user | `{ id, name, email, role }` + Cookie |
| POST | `/api/auth/logout` | No | Clears auth cookie | `{ message }` |
| GET | `/api/auth/me` | Yes (Any) | Returns current user session | `{ id, name, email, role }` |

## Product & Category Routes (Public)

| Method | Endpoint | Auth Required | Purpose | Response |
|---|---|---|---|---|
| GET | `/api/products` | No | Fetches all products (supports `?search` and `?category`) | `[{ id, name, price, stock, image_url... }]` |
| GET | `/api/products/:id` | No | Fetches single product details | `{ id, name, description... }` |
| GET | `/api/categories` | No | Fetches all categories | `[{ id, name, description }]` |

## Cart Routes

| Method | Endpoint | Auth Required | Purpose | Response |
|---|---|---|---|---|
| GET | `/api/cart` | Yes (Customer) | Fetches user's cart | `{ items: [...], total: "0.00" }` |
| POST | `/api/cart` | Yes (Customer) | Adds item or increases quantity. Body: `{ product_id, quantity }` | `{ message }` |
| PUT | `/api/cart/:productId` | Yes (Customer) | Updates specific item quantity. Body: `{ quantity }` | `{ message }` |
| DELETE | `/api/cart/:productId` | Yes (Customer) | Removes item from cart | `{ message }` |
| DELETE | `/api/cart` | Yes (Customer) | Clears entire cart | `{ message }` |

## Wishlist Routes

| Method | Endpoint | Auth Required | Purpose | Response |
|---|---|---|---|---|
| GET | `/api/wishlist` | Yes (Customer) | Fetches user's wishlist | `[{ product details... }]` |
| POST | `/api/wishlist/:productId`| Yes (Customer) | Adds product to wishlist | `{ message }` |
| DELETE |`/api/wishlist/:productId`| Yes (Customer) | Removes product from wishlist| `{ message }` |

## Order Routes

| Method | Endpoint | Auth Required | Purpose | Response |
|---|---|---|---|---|
| POST | `/api/orders` | Yes (Customer) | Places order from current cart. Body: `{ address_id }` | `{ id, message }` |
| GET | `/api/orders` | Yes (Customer) | Fetches user's order history | `[{ id, total_amount, status... }]` |
| GET | `/api/orders/:id` | Yes (Customer) | Fetches specific order details | `{ order, items: [], address: {} }` |
| PATCH| `/api/orders/:id/cancel`| Yes (Customer) | Cancels an eligible order | `{ message }` |

## Seller Routes

*Requires `seller` or `admin` role.*

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/seller/dashboard` | Returns stats (total products, stock, orders, estimated sales) |
| GET | `/api/seller/products` | Lists products owned by the authenticated seller |
| POST | `/api/seller/products` | Creates a new product for this seller |
| PUT | `/api/seller/products/:id` | Updates a product (must be owned by seller) |
| DELETE |`/api/seller/products/:id` | Deletes a product (fails if associated with orders) |
| GET | `/api/seller/orders` | Lists customer orders containing this seller's products |
| PATCH| `/api/seller/orders/:id/status`| Updates order fulfillment status |

## Admin Routes

*Requires `admin` role strictly.*

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Returns platform-wide stats (users, revenue, pending orders) |
| GET | `/api/admin/users` | Lists all users on the platform |
| PATCH| `/api/admin/users/:id/role` | Upgrades/downgrades user roles |
| GET | `/api/admin/products` | Lists all products across all sellers for moderation |
| DELETE |`/api/admin/products/:id` | Admin override deletion of a product |
| CRUD | `/api/admin/categories` | Manage platform categories |
| CRUD | `/api/admin/orders` | View all orders or override status |

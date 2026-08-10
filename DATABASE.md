# Database Documentation

The application uses PostgreSQL as its relational database. The schema is designed to enforce data integrity through foreign keys and constraints.

## ER Diagram

```text
users (id)
 │
 ├── addresses (user_id)
 │
 ├── carts (user_id)
 │    │
 │    └── cart_items (cart_id)
 │          │
 │          └── products (product_id)
 │
 ├── wishlist_items (user_id)
 │    │
 │    └── products (product_id)
 │
 ├── orders (user_id, address_id)
 │    │
 │    └── order_items (order_id)
 │          │
 │          └── products (product_id)
 │
 └── products (seller_id)
      │
      └── categories (category_id)
```

## Tables

### `users`
- **Purpose**: Stores all user accounts (Customers, Sellers, and Admins).
- **Important Fields**: `email` (UNIQUE), `password_hash`, `role` (customer, seller, admin).
- **Primary Key**: `id`

### `categories`
- **Purpose**: Defines product categories for filtering and organization.
- **Important Fields**: `name` (UNIQUE), `description`.
- **Primary Key**: `id`

### `products`
- **Purpose**: Stores product details.
- **Important Fields**: `name`, `price`, `stock`, `image_url`.
- **Primary Key**: `id`
- **Foreign Keys**: 
  - `seller_id` -> `users(id)` (Tracks which seller owns the product)
  - `category_id` -> `categories(id)`

### `addresses`
- **Purpose**: Stores delivery addresses for users.
- **Important Fields**: `full_name`, `address_line1`, `postal_code`, `city`, `state`.
- **Primary Key**: `id`
- **Foreign Keys**: `user_id` -> `users(id)`

### `carts`
- **Purpose**: A logical container for a user's active shopping cart. (1 per user).
- **Primary Key**: `id`
- **Foreign Keys**: `user_id` -> `users(id)` (UNIQUE)

### `cart_items`
- **Purpose**: The individual products and quantities currently inside a user's cart.
- **Important Fields**: `quantity`.
- **Primary Key**: `id`
- **Foreign Keys**:
  - `cart_id` -> `carts(id)`
  - `product_id` -> `products(id)`

### `wishlist_items`
- **Purpose**: Stores products a user has favorited.
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id` -> `users(id)`
  - `product_id` -> `products(id)`

### `orders`
- **Purpose**: Stores finalized checkout sessions.
- **Important Fields**: `total_amount`, `status` (pending, confirmed, processing, shipped, delivered, cancelled).
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id` -> `users(id)`
  - `address_id` -> `addresses(id)`

### `order_items`
- **Purpose**: A historical snapshot of the products purchased within an order.
- **Important Fields**: `price_at_time` (stores the historical price), `quantity`, `subtotal`.
- **Primary Key**: `id`
- **Foreign Keys**:
  - `order_id` -> `orders(id)`
  - `product_id` -> `products(id)`

# Mini Flipkart: Project Overview

## Problem Statement
Traditional local retail lacks an accessible digital platform to track inventory, receive orders, and interact directly with consumers. Existing e-commerce solutions are often monolithic and complex, making them difficult to customize or study. 

## Objective
To design and develop a secure, robust, and scalable full-stack e-commerce web application ("Mini Flipkart") that demonstrates core functionalities including user authentication, role-based access control, real-time inventory management, and secure checkout processes.

## Features
- **Multi-Role System**: Distinct experiences for Customers (shopping), Sellers (inventory management), and Admins (platform moderation).
- **Product Discovery**: Search, categorization, and detailed product views.
- **Order Processing**: Real-time stock validation, cart management, and multi-status order tracking.
- **Account Management**: Profile handling, address books, and wishlists.

## Technology Stack
- **Frontend**: React.js, Vite, React Router, Vanilla CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (hosted via Supabase), `pg` library
- **Security**: JSON Web Tokens (JWT), bcryptjs, Helmet, Express-Rate-Limit

## System Architecture
The application employs a 3-tier architecture:
1. **Client Tier**: A React Single Page Application (SPA) providing a modern, responsive UI.
2. **Application Tier**: A Node/Express REST API securely bridging the frontend to the data layer.
3. **Data Tier**: A relational PostgreSQL database ensuring ACID compliance for critical commerce data (orders, stock).

## Database Design
The database is heavily normalized to ensure data integrity. Core entities include `users`, `products`, `categories`, `orders`, `cart_items`, and `addresses`. Strict foreign key constraints prevent orphan records (e.g., a product cannot be deleted if it exists in an active order history).

## Authentication & Authorization
- **Authentication**: Managed via JWTs issued upon valid login (passwords hashed via bcrypt). Tokens are stored securely in `httpOnly` cookies, shielding them from XSS attacks.
- **Authorization**: Custom backend middleware intercepts requests and evaluates the user's role against required permissions (e.g., blocking customers from accessing seller endpoints).

## Security
The application implements defenses against standard OWASP top vulnerabilities:
- **SQL Injection**: Eliminated through strict use of parameterized queries.
- **IDOR (Insecure Direct Object Reference)**: Prevented via database-level ownership assertions (`WHERE user_id = req.user.id`).
- **XSS**: Mitigated by React's native rendering behavior and HTTP security headers (`helmet`).
- **Brute-force**: Thwarted by API rate-limiting on authentication routes.

## Testing
An automated security testing suite (`scripts/security_test.js`) verifies all Role-Based Access Control (RBAC) boundaries, unauthenticated access denials, and cross-user isolation mechanisms.

## Future Improvements
While fully functional, the platform could be enhanced in the future by adding:
1. Integration with a real Payment Gateway (e.g., Stripe, Razorpay).
2. Email notifications for order status changes.
3. Redis caching for frequently accessed product catalogs to improve performance.
4. User product reviews and rating systems.
5. Automated CI/CD pipelines for cloud deployment.

## Conclusion
Mini Flipkart successfully demonstrates a complete end-to-end e-commerce workflow. By strictly separating roles, maintaining data integrity through relational constraints, and applying industry-standard security practices, the project serves as a comprehensive example of modern web application development.

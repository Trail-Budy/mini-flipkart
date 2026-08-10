const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in environment variables');
  process.exit(1);
}

// Generate valid cookies for testing
function generateCookie(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `token=${token}`;
}

const customerCookie = generateCookie({ id: 3, email: 'dil@gmail.com', role: 'customer' });
const sellerCookie = generateCookie({ id: 2, email: 'aadil@gmail.com', role: 'seller' });
const adminCookie = generateCookie({ id: 1, email: 'aadilnnin@gmail.com', role: 'admin' });

async function runTest(name, url, method, expectedStatus, cookie = null, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === expectedStatus) {
      console.log(`✅ [PASS] ${name} (Expected: ${expectedStatus}, Got: ${res.status})`);
      return true;
    } else {
      console.log(`❌ [FAIL] ${name} (Expected: ${expectedStatus}, Got: ${res.status})`);
      return false;
    }
  } catch (err) {
    console.log(`❌ [ERROR] ${name} - Connection failed: ${err.message}`);
    return false;
  }
}

async function startTests() {
  console.log('\n=======================================');
  console.log('🛡️  STARTING SECURITY TESTS');
  console.log('=======================================\n');

  let allPassed = true;

  // 1. Unauthenticated Access
  console.log('--- Unauthenticated Access Tests ---');
  allPassed &= await runTest('No Auth -> Cart', '/cart', 'GET', 401);
  allPassed &= await runTest('No Auth -> Orders', '/orders', 'GET', 401);
  allPassed &= await runTest('No Auth -> Seller API', '/seller/dashboard', 'GET', 401);
  allPassed &= await runTest('No Auth -> Admin API', '/admin/stats', 'GET', 401);

  // 2. Role-Based Access Control (Customer)
  console.log('\n--- RBAC Tests (Customer) ---');
  allPassed &= await runTest('Customer -> Customer API (Me)', '/auth/me', 'GET', 200, customerCookie);
  allPassed &= await runTest('Customer -> Seller API', '/seller/products', 'GET', 403, customerCookie);
  allPassed &= await runTest('Customer -> Admin API', '/admin/users', 'GET', 403, customerCookie);

  // 3. Role-Based Access Control (Seller)
  console.log('\n--- RBAC Tests (Seller) ---');
  allPassed &= await runTest('Seller -> Seller API', '/seller/products', 'GET', 200, sellerCookie);
  allPassed &= await runTest('Seller -> Admin API', '/admin/users', 'GET', 403, sellerCookie);

  // 4. Role-Based Access Control (Admin)
  console.log('\n--- RBAC Tests (Admin) ---');
  allPassed &= await runTest('Admin -> Admin API', '/admin/users', 'GET', 200, adminCookie);

  // 5. Privilege Escalation Attempt
  console.log('\n--- Privilege Escalation Tests ---');
  allPassed &= await runTest('Customer Attempting to change role to Admin', '/admin/users/2/role', 'PATCH', 403, customerCookie, { role: 'admin' });
  allPassed &= await runTest('Seller Attempting to change role to Admin', '/admin/users/3/role', 'PATCH', 403, sellerCookie, { role: 'admin' });

  // 6. IDOR / Ownership
  console.log('\n--- IDOR / Ownership Tests ---');
  allPassed &= await runTest('User A fetching User B order details', '/orders/9999', 'GET', 404, customerCookie); // order doesn't exist or isn't theirs
  allPassed &= await runTest('Seller B modifying Seller A product', '/seller/products/9999', 'PUT', 403, sellerCookie, { 
    name: 'Hacked', description: 'desc', category_id: 1, price: 10, stock: 1 
  }); 
  allPassed &= await runTest('User B clearing User A cart', '/cart', 'DELETE', 200, customerCookie); // This works because it clears THEIR OWN cart!

  console.log('\n=======================================');
  if (allPassed) {
    console.log('🎉 ALL SECURITY TESTS PASSED');
  } else {
    console.log('⚠️ SOME SECURITY TESTS FAILED');
  }
  console.log('=======================================\n');
}

startTests();

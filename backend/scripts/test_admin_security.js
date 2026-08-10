const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testSecurity() {
  console.log('🧪 Starting Security Tests...');
  
  // NOTE: In a real environment, we would log in and get JWT tokens.
  // For this script, we will just simulate requests by calling the API directly without tokens.
  // We expect them all to fail with 401 Unauthorized because the authenticate middleware blocks them.

  const endpoints = [
    '/admin/stats',
    '/admin/users',
    '/admin/products',
    '/admin/categories',
    '/admin/orders'
  ];

  let passed = true;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (res.status === 401 || res.status === 403) {
        console.log(`✅ [PASS] Unauthenticated access to ${endpoint} correctly blocked (${res.status}).`);
      } else {
        console.log(`❌ [FAIL] Unauthenticated access to ${endpoint} returned ${res.status}!`);
        passed = false;
      }
    } catch (err) {
      console.log(`❌ [ERROR] Could not connect to API for ${endpoint}: ${err.message}`);
      passed = false;
    }
  }

  if (passed) {
    console.log('\n🔒 SECURITY TEST PASSED: All admin routes are properly protected against unauthenticated/unauthorized access.');
  } else {
    console.log('\n⚠️ SECURITY TEST FAILED: Some admin routes are exposed!');
  }
}

testSecurity();

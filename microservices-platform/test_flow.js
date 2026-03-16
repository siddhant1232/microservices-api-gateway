const axios = require('axios');

async function runTests() {
  const BASE_URL = 'http://localhost:3000';

  console.log('--- Starting Microservices Platform Integration Tests ---\\n');

  try {
    // 1. Register a new user
    console.log('1. Testing User Registration...');
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'password123';

    let res = await axios.post(`${BASE_URL}/api/auth/register`, {
      username,
      email,
      password
    });
    
    console.log(`Registration successful: ${res.data.message}, user ID: ${res.data.userId}`);
    const userId = res.data.userId;

    // 2. Login to get JWT
    console.log('\\n2. Testing Login to acquire JWT...');
    res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    
    const token = res.data.token;
    console.log(`Login successful, obtained JWT token.`);

    // 3. Test Protected Route (User Profile via Gateway)
    console.log('\\n3. Testing Protected Route (/users/:id/profile)...');
    res = await axios.get(`${BASE_URL}/users/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`Protected route successful. Profile response:`, res.data);

    // 4. Test Error Handling (No Token)
    console.log('\\n4. Testing Protected Route without Token (Expect 403)...');
    try {
      await axios.get(`${BASE_URL}/users/${userId}/profile`);
      console.log('FAIL: Request should have been blocked');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`PASSED: Blocked with 403 status. Message: ${err.response.data.error}`);
      } else {
        console.log(`Unexpected error:`, err.message);
      }
    }

    // 5. Rate Limiting Test (Send > 100 requests)
    console.log('\\n5. Testing Rate Limiting (Sending 105 rapid requests to / )...');
    let hitLimit = false;
    for (let i = 0; i < 105; i++) {
      try {
        await axios.get(`${BASE_URL}/`);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          hitLimit = true;
          console.log(`Rate limit triggered on request ${i + 1} with status 429!`);
          break;
        }
      }
    }
    
    if (!hitLimit) {
      console.log('FAIL: Rate limit was not triggered');
    }

    console.log('\\n--- Integration Tests Complete ---');
    console.log('Please check docker-compose logs for notification-service to verify BullMQ queue processing!');

  } catch (error) {
    if (error.response) {
      console.error(`\\nIntegration test failed during HTTP request: Status ${error.response.status}`, error.response.data);
    } else {
      console.error(`\\nIntegration test failed:`, error.message);
    }
  }
}

runTests();

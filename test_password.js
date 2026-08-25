const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      email: 'client@myclaim.com',
      password: '123456'
    });
    const token = loginRes.data.token;
    console.log("Logged in:", token.substring(0, 10));

    const patchRes = await axios.patch('http://localhost:5005/api/users/client/profile', {
      currentPassword: '123456',
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Patch response:", patchRes.status);
    
    // Revert it
    const revertRes = await axios.patch('http://localhost:5005/api/users/client/profile', {
      currentPassword: 'newpassword123',
      newPassword: '123456'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Revert response:", revertRes.status);
    
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
})();

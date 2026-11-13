const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const DESKTOP_DATA_DIR = path.join(os.homedir(), 'Desktop', 'kabani-backend-data');
const USERS_FILE = path.join(DESKTOP_DATA_DIR, 'users.json');

// Ensure Desktop backend storage directory and users.json exist
try {
  if (!fs.existsSync(DESKTOP_DATA_DIR)) {
    fs.mkdirSync(DESKTOP_DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    const seedUsers = [
      {
        name: "Rajesh Kumar (Kabani Freight)",
        mobile: "9829011223",
        email: "rajesh.kabani@freight.com",
        password: "Password@123",
        role: "transporter",
        registeredAt: new Date().toISOString()
      },
      {
        name: "Ramesh Singh (Truck Owner)",
        mobile: "9876543210",
        email: "ramesh.driver@gmail.com",
        password: "Driver@123",
        role: "driver",
        registeredAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf8');
  }
} catch (e) {
  console.error("Storage init warning:", e.message);
}

function getStoredUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading users file:", e);
  }
  return [];
}

function saveStoredUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error saving users file:", e);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url.split('?')[0];

  // API Endpoints for persistent backend storage
  if (reqPath === '/api/reset-users' && req.method === 'POST') {
    const seedUsers = [
      {
        name: "Rajesh Kumar (Kabani Freight)",
        mobile: "9829011223",
        email: "rajesh.kabani@freight.com",
        password: "Password@123",
        role: "transporter",
        registeredAt: new Date().toISOString()
      },
      {
        name: "Ramesh Singh (Truck Owner)",
        mobile: "9876543210",
        email: "driver.ramesh@kabani.com",
        password: "Driver@123",
        role: "driver",
        registeredAt: new Date().toISOString()
      }
    ];
    saveStoredUsers(seedUsers);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Reset to seed users' }));
    return;
  }

  if (reqPath === '/api/users' && req.method === 'GET') {
    const users = getStoredUsers();
    // Return sanitized list (without passwords for safety)
    const sanitized = users.map(u => ({
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      role: u.role,
      registeredAt: u.registeredAt
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sanitized));
    return;
  }

  if (reqPath === '/api/signup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { name, mobile, email, password, role } = data;

        if (!name || !mobile || !email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'All fields are required.' }));
          return;
        }

        const users = getStoredUsers();
        const existing = users.find(u => u.mobile === mobile);
        if (existing) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'This mobile number is already registered.' }));
          return;
        }

        const newUser = {
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          password: password, // exact case-sensitive
          role: role || 'transporter',
          registeredAt: new Date().toISOString()
        };

        users.push(newUser);
        saveStoredUsers(users);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'User registered successfully on local backend.',
          user: { name: newUser.name, mobile: newUser.mobile, email: newUser.email, role: newUser.role }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (reqPath === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { mobile, password } = data;

        if (!mobile || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Mobile and password are required.' }));
          return;
        }

        const users = getStoredUsers();
        const user = users.find(u => u.mobile === mobile.trim());

        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, code: 'USER_NOT_FOUND', message: 'No registered user found with this mobile number. Please Sign Up.' }));
          return;
        }

        // Exact case-sensitive password comparison
        if (user.password !== password) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, code: 'WRONG_PASSWORD', message: 'Incorrect password. Passwords are strictly case-sensitive.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: { name: user.name, mobile: user.mobile, email: user.email, role: user.role }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Kabani - Shyam Freight Carriers Server running at http://127.0.0.1:${PORT}`);
  console.log(`Backend storage linked to: ${USERS_FILE}`);
});

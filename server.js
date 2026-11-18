const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const DESKTOP_DATA_DIR = path.join(os.homedir(), 'Desktop', 'kabani-backend-data');
const USERS_FILE = path.join(DESKTOP_DATA_DIR, 'users.json');
const LOADS_FILE = path.join(DESKTOP_DATA_DIR, 'loads.json');

// Ensure Desktop backend storage directory and users.json exist
try {
  if (!fs.existsSync(DESKTOP_DATA_DIR)) {
    fs.mkdirSync(DESKTOP_DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    const seedUsers = [
      {
        name: "Admin",
        mobile: "7231858636",
        email: "sunilgahlot0636@gmail.com",
        password: "Coronary@7",
        role: "owner",
        registeredAt: new Date().toISOString()
      },
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
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf8');
  }
} catch (e) {
  console.error("Storage init warning:", e.message);
}


// Ensure loads.json exists on Desktop
const seedLoads = [
  {
    id: "LOAD-701",
    originEn: "Delhi (Azadpur Mandi)",
    originHi: "दिल्ली (आजादपुर मंडी)",
    destEn: "Jaipur (VKI Transport Nagar)",
    destHi: "जयपुर (VKI ट्रांसपोर्ट नगर)",
    date: "2026-11-13",
    materialKey: "agriculture",
    weightEn: "16 Tons (16 MT)",
    weightHi: "16 टन (16 MT)",
    truckTypeEn: "10 Wheeler",
    truckTypeHi: "10 चक्का",
    transporterEn: "Kabani Express Logistics",
    transporterHi: "कबानी एक्सप्रेस लॉजिस्टिक्स",
    phone: "9829011223",
    posterMobile: "9829011223",
    posterEmail: "rajesh.kabani@freight.com",
    posterName: "Rajesh Kumar (Kabani Freight)",
    status: "available",
    postedAgoEn: "12 mins ago",
    postedAgoHi: "12 मिनट पहले"
  },
  {
    id: "LOAD-702",
    originEn: "Ahmedabad (Changodar GIDC)",
    originHi: "अहमदाबाद (चांगोदर GIDC)",
    destEn: "Mumbai (Bhiwandi Logistics Park)",
    destHi: "मुंबई (भिवंडी लॉजिस्टिक्स पार्क)",
    date: "2026-11-13",
    materialKey: "industrial",
    weightEn: "25 Tons (25 MT)",
    weightHi: "25 टन (25 MT)",
    truckTypeEn: "14 Wheeler",
    truckTypeHi: "14 चक्का",
    transporterEn: "Kabani Freight Carriers",
    transporterHi: "कबानी फ्रेट कैरियर्स",
    phone: "9876543210",
    posterMobile: "9876543210",
    posterEmail: "driver.ramesh@kabani.com",
    posterName: "Ramesh Singh (Truck Owner)",
    status: "available",
    postedAgoEn: "28 mins ago",
    postedAgoHi: "28 मिनट पहले"
  },
  {
    id: "LOAD-703",
    originEn: "Ludhiana (Transport Nagar)",
    originHi: "लुधियाना (ट्रांसपोर्ट नगर)",
    destEn: "Kanpur (Transport Nagar)",
    destHi: "कानपुर (ट्रांसपोर्ट नगर)",
    date: "2026-11-14",
    materialKey: "textiles",
    weightEn: "12 Tons (12 MT)",
    weightHi: "12 टन (12 MT)",
    truckTypeEn: "32ft Container",
    truckTypeHi: "32 फीट कंटेनर",
    transporterEn: "Punjab Highway Fleet",
    transporterHi: "पंजाब हाईवे फ्लीट",
    phone: "9814055667",
    posterMobile: "9814055667",
    posterEmail: "punjab@fleet.com",
    posterName: "Harpreet Singh",
    status: "available",
    postedAgoEn: "45 mins ago",
    postedAgoHi: "45 मिनट पहले"
  },
  {
    id: "LOAD-704",
    originEn: "Pune (Chakan MIDC)",
    originHi: "पुणे (चाकण MIDC)",
    destEn: "Delhi (Sanjay Gandhi Transport Nagar)",
    destHi: "दिल्ली (संजय गांधी ट्रांसपोर्ट नगर)",
    date: "2026-11-14",
    materialKey: "machinery",
    weightEn: "28 Tons (28 MT)",
    weightHi: "28 टन (28 MT)",
    truckTypeEn: "Trailer / Low Bed",
    truckTypeHi: "ट्रेलर / लो-बेड",
    transporterEn: "Maharashtra Heavy Move",
    transporterHi: "महाराष्ट्र हेवी मूव",
    phone: "9820044556",
    posterMobile: "9820044556",
    posterEmail: "mh.heavy@move.com",
    posterName: "Vijay Shinde",
    status: "available",
    postedAgoEn: "1 hour ago",
    postedAgoHi: "1 घंटा पहले"
  },
  {
    id: "LOAD-705",
    originEn: "Kolkata (Dankuni Coal & Goods Hub)",
    originHi: "कोलकाता (दानकुनी कोल व गुड्स हब)",
    destEn: "Patna (Transport Nagar)",
    destHi: "पटना (ट्रांसपोर्ट नगर)",
    date: "2026-11-15",
    materialKey: "minerals",
    weightEn: "35 Tons (35 MT)",
    weightHi: "35 टन (35 MT)",
    truckTypeEn: "16 Wheeler",
    truckTypeHi: "16 चक्का",
    transporterEn: "Bengal Transport Agency",
    transporterHi: "बंगाल ट्रांसपोर्ट एजेंसी",
    phone: "9831099887",
    posterMobile: "9831099887",
    posterEmail: "bengal@transagency.in",
    posterName: "Amitabha Roy",
    status: "assigned",
    postedAgoEn: "2 hours ago",
    postedAgoHi: "2 घंटे पहले"
  }
];

try {
  if (!fs.existsSync(LOADS_FILE)) {
    fs.writeFileSync(LOADS_FILE, JSON.stringify(seedLoads, null, 2), 'utf8');
  }
} catch (e) {
  console.error("Loads storage init warning:", e.message);
}

function getStoredLoads() {
  try {
    if (fs.existsSync(LOADS_FILE)) {
      return JSON.parse(fs.readFileSync(LOADS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Error reading loads file:", e);
  }
  return seedLoads;
}

function saveStoredLoads(loads) {
  try {
    fs.writeFileSync(LOADS_FILE, JSON.stringify(loads, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Error saving loads file:", e);
    return false;
  }
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
  
  // Loads API
  if (reqPath === '/api/loads' && req.method === 'GET') {
    const loads = getStoredLoads();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loads));
    return;
  }

  if (reqPath === '/api/loads' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let loads = getStoredLoads();
        if (Array.isArray(payload)) {
          loads = payload;
        } else if (payload && payload.id) {
          // unshift single load
          loads.unshift(payload);
        }
        saveStoredLoads(loads);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: loads.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (reqPath === '/api/reset-loads' && req.method === 'POST') {
    saveStoredLoads(seedLoads);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Reset to seed loads' }));
    return;
  }

  if (reqPath === '/api/reset-users' && req.method === 'POST') {
    const seedUsers = [
      {
        name: "Sunil Gahlot (Website Owner)",
        mobile: "7231858636",
        email: "sunilgahlot0636@gmail.com",
        password: "Owner@7231858636",
        role: "owner",
        registeredAt: new Date().toISOString()
      },
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

        const isOwner = (mobile.trim() === '7231858636' || email.trim().toLowerCase() === 'sunilgahlot0636@gmail.com');
        const newUser = {
          name: isOwner ? (name.trim() || "Sunil Gahlot (Website Owner)") : name.trim(),
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          password: password, // exact case-sensitive
          role: isOwner ? 'owner' : (role || 'transporter'),
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
  console.log(`Backend storage linked to: ${USERS_FILE}\nBackend loads linked to: ${LOADS_FILE}`);
});

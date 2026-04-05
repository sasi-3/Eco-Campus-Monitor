const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Bannari Amman Institute of Technology Coordinates
const LATITUDE = 11.4970126;
const LONGITUDE = 77.2771024;

let LOCATIONS = [
    "Sathyamangalam",
    "Main Library",
    "Science Block A",
    "Student Union",
    "Cafeteria",
    "Gymnasium"
];

// Initial memory storage for sensors
let sensors = [
    {
        id: "S1", location: "Main Library", type: "TEMPERATURE", status: "HIGH",
        lastReading: 22.5, unit: "°C",
        installDate: "2023-01-15", expiryDate: "2026-01-15", utilizationRate: 92, isActive: true
    },
    {
        id: "S2", location: "Main Library", type: "AIR_QUALITY", status: "HIGH",
        lastReading: 45, unit: "AQI",
        installDate: "2023-01-15", expiryDate: "2026-03-20", utilizationRate: 88, isActive: true
    },
    {
        id: "S3", location: "Science Block A", type: "HUMIDITY", status: "HIGH",
        lastReading: 60, unit: "%",
        installDate: "2022-06-10", expiryDate: "2025-06-10", utilizationRate: 74, isActive: true
    },
    {
        id: "S4", location: "Student Union", type: "NOISE", status: "MEDIUM",
        lastReading: 85, unit: "dB",
        installDate: "2022-09-01", expiryDate: "2026-04-05", utilizationRate: 81, isActive: true
    },
    {
        id: "S5", location: "Cafeteria", type: "AIR_QUALITY", status: "HIGH",
        lastReading: 32, unit: "AQI",
        installDate: "2023-03-20", expiryDate: "2026-03-28", utilizationRate: 96, isActive: true
    },
    {
        id: "S6", location: "Gymnasium", type: "TEMPERATURE", status: "HIGH",
        lastReading: 27.1, unit: "°C",
        installDate: "2021-11-01", expiryDate: "2025-11-01", utilizationRate: 65, isActive: true
    },
    {
        id: "S7", location: "Sathyamangalam", type: "AIR_QUALITY", status: "MEDIUM",
        lastReading: 65, unit: "AQI",
        installDate: "2023-05-15", expiryDate: "2026-05-15", utilizationRate: 80, isActive: true
    },
];

// Initial users array
let users = [
    { id: '1', name: 'System Admin', email: 'admin@edu.in', password: 'demo123', role: 'ADMIN', lastActive: 'Active now' },
    { id: '2', name: 'Dr. Faculty Member', email: 'faculty@edu.in', password: 'demo123', role: 'FACULTY', lastActive: '1 hr ago' },
    { id: '3', name: 'Student Monitor', email: 'student@edu.in', password: 'demo123', role: 'STUDENT', lastActive: '5 min ago' }
];

// Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Return user without password
        const { password: _, ...safeUser } = user;
        safeUser.token = 'mock-jwt-token-12345';
        res.json({ success: true, user: safeUser });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }
});

// GET all users (Admin only ideally)
app.get('/api/users', (req, res) => {
    // Return all users safely without passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// Create new user (Admin adding students/faculty)
app.post('/api/users', (req, res) => {
    const { name, email, password, role } = req.body;
    const oldIndex = users.findIndex(u => u.email === email);
    if (oldIndex >= 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name: name || email.split('@')[0],
        email,
        password, // stored correctly in this toy example
        role: role || 'STUDENT',
        lastActive: 'Never'
    };
    users.push(newUser);

    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser });
});

// Edit user (e.g. changing role, name, or password)
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = users.find(u => u.id === id);
    if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = password; // Admin resetting pass

        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    users = users.filter(u => u.id !== id);
    res.json({ success: true });
});

// GET all sensors
app.get('/api/sensors', (req, res) => {
    res.json(sensors);
});

// POST new sensor
app.post('/api/sensors', (req, res) => {
    const { location, type } = req.body;

    // Extract location info
    if (!LOCATIONS.includes(location)) {
        LOCATIONS.push(location);
    }

    const unitMap = {
        'TEMPERATURE': '°C',
        'HUMIDITY': '%',
        'AIR_QUALITY': 'AQI',
        'NOISE': 'dB'
    };

    // basic initial readings based on type
    const initialReadingMap = {
        'TEMPERATURE': 25,
        'HUMIDITY': 50,
        'AIR_QUALITY': 30,
        'NOISE': 40
    };

    const newSensor = {
        id: `S${sensors.length + 1}`,
        location,
        type,
        status: "HIGH",
        lastReading: initialReadingMap[type],
        unit: unitMap[type],
        installDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
        utilizationRate: 100,
        isActive: true,
    };

    sensors.push(newSensor);
    res.json({ success: true, sensor: newSensor });
});

// Toggle sensor status, active state, or delete
app.put('/api/sensors/:id', (req, res) => {
    const { status, isActive } = req.body;
    const { id } = req.params;
    const sensor = sensors.find(s => s.id === id);
    if (sensor) {
        if (status !== undefined) sensor.status = status;
        if (isActive !== undefined) sensor.isActive = isActive;
        res.json({ success: true, sensor });
    } else {
        res.status(404).json({ success: false, message: 'Sensor not found' });
    }
});

app.delete('/api/sensors/:id', (req, res) => {
    const { id } = req.params;
    sensors = sensors.filter(s => s.id !== id);
    res.json({ success: true });
});

// Provide real-time data endpoint
app.get('/api/readings/latest', async (req, res) => {
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m`;
        const weatherRes = await axios.get(weatherUrl);

        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=us_aqi`;
        const aqiRes = await axios.get(aqiUrl);

        const baseTemp = weatherRes.data.current.temperature_2m;
        const baseHumidity = weatherRes.data.current.relative_humidity_2m;
        const baseAqi = aqiRes.data.current.us_aqi || 25; // fallback AQI if null

        // Simulate slightly varied readings based on the root real-time values for different campus locations
        const readings = LOCATIONS.map(location => {
            const tempOffset = Math.random() * 3 - 1;
            const humOffset = Math.random() * 10 - 5;
            const aqiOffset = Math.random() * 5 - 2;

            const noise = location.includes("Library") ? 30 + Math.random() * 10 : 50 + Math.random() * 30;

            return {
                timestamp: new Date().toISOString(),
                temperature: baseTemp + tempOffset,
                humidity: baseHumidity + humOffset,
                aqi: Math.max(0, baseAqi + aqiOffset),
                noise,
                location,
            };
        });

        res.json(readings);
    } catch (error) {
        console.error("Open-Meteo Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch external weather data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoCampus backend API listening at http://0.0.0.0:${PORT}`);
});

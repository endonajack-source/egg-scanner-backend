const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let activeServers = {};
const API_KEY = "SECRET_EGG_KEY_123";

app.get('/', (req, res) => {
    res.send("Egg Scanner Backend is Live!");
});

app.post('/api/report-egg', (req, res) => {
    const { apiKey, jobId, placeId, eggType, rarity, incomeRate, multiplier } = req.body;

    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    if (!jobId || !eggType) {
        return res.status(400).json({ error: "Missing data" });
    }

    activeServers[jobId] = {
        jobId,
        placeId,
        eggType,
        rarity: rarity || "Rare",
        incomeRate: incomeRate || "$0/s",
        multiplier: multiplier || "x1.00",
        updatedAt: Date.now()
    };

    return res.status(200).json({ success: true });
});

app.get('/api/get-servers', (req, res) => {
    const now = Date.now();
    const EXPIRE_TIME_MS = 2 * 60 * 1000;

    for (const jobId in activeServers) {
        if (now - activeServers[jobId].updatedAt > EXPIRE_TIME_MS) {
            delete activeServers[jobId];
        }
    }

    return res.status(200).json(Object.values(activeServers));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

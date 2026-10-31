const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Temporary memory database storing active servers
let activeServers = {};

// Secret API key to secure reporting endpoints
const API_KEY = "SECRET_EGG_KEY_123";

// 1. Endpoint for Scraper accounts to upload rare egg locations
app.post('/api/report-egg', (req, res) => {
    const { apiKey, jobId, placeId, eggType, rarity, biome } = req.body;

    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    if (!jobId || !eggType) {
        return res.status(400).json({ error: "Missing required server data" });
    }

    activeServers[jobId] = {
        jobId,
        placeId,
        eggType,
        rarity: rarity || "Rare",
        biome: biome || "Main",
        updatedAt: Date.now()
    };

    console.log(`[+] Tracked ${rarity} ${eggType} in server: ${jobId.substring(0, 8)}`);
    return res.status(200).json({ success: true });
});

// 2. Endpoint for Main Account UI to fetch active servers
app.get('/api/get-servers', (req, res) => {
    const now = Date.now();
    const EXPIRE_TIME_MS = 5 * 60 * 1000; // Auto-delete servers older than 5 minutes

    for (const jobId in activeServers) {
        if (now - activeServers[jobId].updatedAt > EXPIRE_TIME_MS) {
            delete activeServers[jobId];
        }
    }

    return res.status(200).json(Object.values(activeServers));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[+] Scanner Backend listening on port ${PORT}`);
});

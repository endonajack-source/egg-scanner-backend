const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

let activeServers = {};
const API_KEY = "SECRET_EGG_KEY_123";

app.get('/', (req, res) => {
    res.send("Backend active!");
});

app.post('/api/report-egg', (req, res) => {
    const { apiKey, jobId, placeId, eggType, rarity, incomeRate, multiplier } = req.body;

    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    if (!jobId || !eggType) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    activeServers[jobId] = {
        jobId,
        placeId,
        eggType,
        rarity: rarity || "Secret",
        incomeRate: incomeRate || "$1B/s",
        multiplier: multiplier || "x10.00",
        updatedAt: Date.now()
    };

    console.log(`[+] Server added: ${eggType} (${jobId})`);
    return res.status(200).json({ success: true });
});

app.get('/api/get-servers', (req, res) => {
    const now = Date.now();
    const EXPIRE_MS = 2 * 60 * 1000; // 2 minutes

    for (const id in activeServers) {
        if (now - activeServers[id].updatedAt > EXPIRE_MS) {
            delete activeServers[id];
        }
    }

    return res.status(200).json(Object.values(activeServers));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

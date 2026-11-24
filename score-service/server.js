import express from 'express';
import { computeScore } from './scoring.js';

const app = express();
const PORT = process.env.PORT || 3000;
const EPHEMERIS_URL = process.env.EPHEMERIS_URL || 'http://localhost:3000';

function parseParams(req) {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const date = req.query.date ? new Date(req.query.date) : new Date();
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { error: 'lat invalide' };
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { error: 'lon invalide' };
    if (isNaN(date.getTime())) return { error: 'date invalide (ISO attendu)' };
    return { lat, lon, date };
}

async function getJson(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return res.json();
}

async function getCloudCover(lat, lon, date) {
    const day = date.toISOString().slice(0, 10);
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=cloud_cover&timezone=UTC&start_date=${day}&end_date=${day}`;
    const data = await getJson(url);
    const hour = date.toISOString().slice(0, 13) + ':00';
    const i = data.hourly.time.indexOf(hour);
    if (i === -1) throw new Error('heure introuvable dans la prévision météo');
    return data.hourly.cloud_cover[i];
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get(['/', '/score'], async (req, res) => {
    const p = parseParams(req);
    if (p.error) return res.status(400).json({ error: p.error });

    const qs = `lat=${p.lat}&lon=${p.lon}&date=${encodeURIComponent(p.date.toISOString())}`;

    try {
        const [planetsData, moon, cloudCover] = await Promise.all([
            getJson(`${EPHEMERIS_URL}/planets?${qs}`),
            getJson(`${EPHEMERIS_URL}/moon?${qs}`),
            getCloudCover(p.lat, p.lon, p.date)
        ]);

        const result = computeScore({
            cloudCover,
            isNight: planetsData.isNight,
            moon,
            planets: planetsData.planets
        });

        res.json({
            date: p.date.toISOString(),
            location: { lat: p.lat, lon: p.lon },
            ...result,
            details: {
                cloudCover,
                isNight: planetsData.isNight,
                moon: { phase: moon.phase, illumination: moon.illumination, visible: moon.visible },
                visiblePlanets: planetsData.planets.filter((x) => x.visible).map((x) => x.name)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: 'service amont indisponible', detail: err.message });
    }
});

app.listen(PORT, () => console.log(`score-service écoute sur le port ${PORT}`));
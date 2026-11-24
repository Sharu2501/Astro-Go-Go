import express from 'express';
import * as Astronomy from 'astronomy-engine';

const app = express();
const PORT = process.env.PORT || 3000;

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const MIN_ALTITUDE = 5;

function parseParams(req) {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const date = req.query.date ? new Date(req.query.date) : new Date();

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { error: 'lat doit être un nombre entre -90 et 90' };
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
        return { error: 'lon doit être un nombre entre -180 et 180' };
    }
    if (isNaN(date.getTime())) {
        return { error: 'date invalide (format ISO attendu, ex: 2026-11-24T21:00:00Z)' };
    }
    return { lat, lon, date };
}

function positionOf(body, date, observer) {
    const eq = Astronomy.Equator(body, date, observer, true, true);
    return Astronomy.Horizon(date, observer, eq.ra, eq.dec, 'normal');
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/planets', (req, res) => {
    const p = parseParams(req);
    if (p.error) return res.status(400).json({ error: p.error });

    const observer = new Astronomy.Observer(p.lat, p.lon, 0);
    const sun = positionOf('Sun', p.date, observer);

    const planets = PLANETS.map((name) => {
        const pos = positionOf(name, p.date, observer);
        return {
            name,
            altitude: Number(pos.altitude.toFixed(1)),
            azimuth: Number(pos.azimuth.toFixed(1)),
            visible: pos.altitude > MIN_ALTITUDE
        };
    });

    res.json({
        date: p.date.toISOString(),
        location: { lat: p.lat, lon: p.lon },
        isNight: sun.altitude < -6,
        planets
    });
});

function moonPhaseName(angle) {
    if (angle < 22.5 || angle >= 337.5) return 'Nouvelle Lune';
    if (angle < 67.5) return 'Premier croissant';
    if (angle < 112.5) return 'Premier quartier';
    if (angle < 157.5) return 'Gibbeuse croissante';
    if (angle < 202.5) return 'Pleine Lune';
    if (angle < 247.5) return 'Gibbeuse décroissante';
    if (angle < 292.5) return 'Dernier quartier';
    return 'Dernier croissant';
}

app.get('/moon', (req, res) => {
    const p = parseParams(req);
    if (p.error) return res.status(400).json({ error: p.error });

    const observer = new Astronomy.Observer(p.lat, p.lon, 0);
    const angle = Astronomy.MoonPhase(p.date);
    const illum = Astronomy.Illumination('Moon', p.date);
    const pos = positionOf('Moon', p.date, observer);

    res.json({
        date: p.date.toISOString(),
        phase: moonPhaseName(angle),
        phaseAngle: Number(angle.toFixed(1)),
        illumination: Number((illum.phase_fraction * 100).toFixed(1)),
        altitude: Number(pos.altitude.toFixed(1)),
        visible: pos.altitude > 0
    });
});

app.listen(PORT, () => {
    console.log(`ephemeris-service écoute sur le port ${PORT}`);
});
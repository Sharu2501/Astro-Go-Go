const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));

export const WEIGHTS = { clouds: 0.5, moon: 0.25, planets: 0.25 };

/**
 * @param {object} input
 * @param {number} input.cloudCover  couverture nuageuse en % (0-100)
 * @param {boolean} input.isNight    true si le Soleil est sous -6°
 * @param {{illumination:number, visible:boolean}} input.moon  illumination en %
 * @param {{name:string, visible:boolean}[]} input.planets
 */
export function computeScore({ cloudCover, isNight, moon, planets }) {
    if (!isNight) {
        return {
            score: 0,
            verdict: 'NO-GO',
            reason: "Il fait jour : rien n'est observable.",
            parts: { clouds: 0, moon: 0, planets: 0 }
        };
    }

    const clouds = clamp(100 - cloudCover);
    const moonScore = moon.visible ? clamp(100 - moon.illumination) : 100;
    const visibleCount = planets.filter((p) => p.visible).length;
    const planetScore = (Math.min(visibleCount, 3) / 3) * 100;

    const score = Math.round(
        WEIGHTS.clouds * clouds + WEIGHTS.moon * moonScore + WEIGHTS.planets * planetScore
    );

    let verdict;
    if (score >= 70) verdict = 'GO';
    else if (score >= 40) verdict = 'MOYEN';
    else verdict = 'NO-GO';

    return {
        score,
        verdict,
        parts: {
            clouds: Math.round(clouds),
            moon: Math.round(moonScore),
            planets: Math.round(planetScore)
        }
    };
}
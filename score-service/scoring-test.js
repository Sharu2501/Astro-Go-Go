import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeScore } from './scoring.js';

const planets = (n) =>
    Array.from({ length: 5 }, (_, i) => ({ name: `P${i}`, visible: i < n }));

test('score 0 en plein jour', () => {
    const r = computeScore({
        cloudCover: 0,
        isNight: false,
        moon: { illumination: 0, visible: false },
        planets: planets(5)
    });
    assert.equal(r.score, 0);
    assert.equal(r.verdict, 'NO-GO');
});

test('nuit parfaite : ciel dégagé, pas de Lune, 3 planètes -> 100', () => {
    const r = computeScore({
        cloudCover: 0,
        isNight: true,
        moon: { illumination: 0, visible: false },
        planets: planets(3)
    });
    assert.equal(r.score, 100);
    assert.equal(r.verdict, 'GO');
});

test('ciel entièrement couvert fait chuter le score', () => {
    const r = computeScore({
        cloudCover: 100,
        isNight: true,
        moon: { illumination: 0, visible: false },
        planets: planets(3)
    });
    assert.equal(r.score, 50);
    assert.equal(r.verdict, 'MOYEN');
});

test('pleine Lune visible pénalise', () => {
    const sansLune = computeScore({
        cloudCover: 0, isNight: true,
        moon: { illumination: 100, visible: false }, planets: planets(3)
    });
    const avecLune = computeScore({
        cloudCover: 0, isNight: true,
        moon: { illumination: 100, visible: true }, planets: planets(3)
    });
    assert.ok(avecLune.score < sansLune.score);
});

test('aucune planète visible : 75 max', () => {
    const r = computeScore({
        cloudCover: 0, isNight: true,
        moon: { illumination: 0, visible: false }, planets: planets(0)
    });
    assert.equal(r.score, 75);
});
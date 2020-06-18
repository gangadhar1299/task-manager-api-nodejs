const { calculateTip } = require('../src/math');

test('Should calculate tip for given total', () => {
    expect(calculateTip(100, 0.12)).toBe(112);
});

test('Should calculate total with tip with default tip', () => {
    const total = calculateTip(100);
    expect(total).toBe(125);
});
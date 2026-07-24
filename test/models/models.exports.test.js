const fs = require('fs');
const path = require('path');

describe('server/models exports', () => {
  const modelsDir = path.join(__dirname, '../../server/models');
  const files = fs
    .readdirSync(modelsDir)
    .filter((file) => file.endsWith('.js'));

  test.each(files)('loads %s and exposes public API', (file) => {
    const mod = require(`../../server/models/${file}`);

    expect(mod).toBeDefined();

    if (typeof mod === 'object' && mod !== null) {
      expect(Object.keys(mod).length).toBeGreaterThan(0);
    }
  });
});

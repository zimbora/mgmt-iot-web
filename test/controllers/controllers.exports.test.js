const fs = require('fs');
const path = require('path');

describe('server/controllers exports', () => {
  const controllersDir = path.join(__dirname, '../../server/controllers');
  const files = fs
    .readdirSync(controllersDir)
    .filter((file) => file.endsWith('.js'));

  test.each(files)('loads %s and exposes public API', (file) => {
    const mod = require(`../../server/controllers/${file}`);

    expect(mod).toBeDefined();

    if (typeof mod === 'object' && mod !== null) {
      expect(Object.keys(mod).length).toBeGreaterThan(0);
    }
  });
});

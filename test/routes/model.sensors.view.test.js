const fs = require('fs');
const path = require('path');

describe('model sensors page propagate behavior', () => {
  const sensorsViewPath = path.join(__dirname, '../../server/public/views/pages/model/sensors.ejs');

  it('closes confirmation modal and does not reload page after propagate response', () => {
    const viewContent = fs.readFileSync(sensorsViewPath, 'utf8');
    const propagateBlockMatch = viewContent.match(/api\.model\.propagateSensor\([\s\S]*?\n\s*}\);\n\s*}\n\s*}\);/);

    expect(propagateBlockMatch).not.toBeNull();

    const propagateBlock = propagateBlockMatch[0];
    expect(propagateBlock).toContain("$('#modalConfirmation').modal('hide');");
    expect(propagateBlock).not.toContain('location.reload();');
  });
});

const fs = require('fs');
const path = require('path');

describe('device sensors readable view behavior', () => {
  const sensorsViewPath = path.join(__dirname, '../../server/public/views/pages/device/sensors.ejs');
  const addSensorModalPath = path.join(__dirname, '../../server/public/views/partials/modal/addSensor.ejs');

  it('renders the read action only when readable is not explicitly false', () => {
    const viewContent = fs.readFileSync(sensorsViewPath, 'utf8');
    expect(viewContent).toContain("const canReadSensor = sensor?.readable == null || sensor?.readable === true || sensor?.readable === 1 || sensor?.readable === '1';");
    expect(viewContent).toContain("${canReadSensor ? `<button class=\"btn btn-light btn-sm\" type=\"button\"");
  });

  it('includes a readable checkbox in the add sensor modal', () => {
    const modalContent = fs.readFileSync(addSensorModalPath, 'utf8');
    expect(modalContent).toContain('id="_modalReadable_" checked');
    expect(modalContent).toContain('for="_modalReadable_">readable</label>');
  });
});

const fs = require('fs');
const path = require('path');

describe('model sensors page propagate behavior', () => {
  const sensorsViewPath = path.join(__dirname, '../../server/public/views/pages/model/sensors.ejs');

  it('closes confirmation modal and does not reload page after propagate response', () => {
    const viewContent = fs.readFileSync(sensorsViewPath, 'utf8');
    expect(viewContent).toContain('api.model.propagateSensor(modelID, idToPropagate, (err,res)=>{');
    expect(viewContent).toContain("$('#modalConfirmation').modal('hide');");
    expect(viewContent).not.toMatch(/api\.model\.propagateSensor[\s\S]*location\.reload\(\);/);
  });

  it('shows a readable column and update toggle on template sensors', () => {
    const viewContent = fs.readFileSync(sensorsViewPath, 'utf8');
    expect(viewContent).toContain('<th>readable</th>');
    expect(viewContent).toContain('class="form-check-input sensor-readable-toggle"');
    expect(viewContent).toContain('api.model.updateSensor(modelID,id,"readable",readable');
    expect(viewContent).toContain("$('.sensor-active-toggle').on('change'");
  });
});

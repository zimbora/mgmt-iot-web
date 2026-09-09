const fs = require('fs');
const path = require('path');

describe('model actuators page propagate behavior', () => {
  const actuatorsViewPath = path.join(__dirname, '../../server/public/views/pages/model/actuators.ejs');

  it('closes confirmation modal and does not reload page after propagate response', () => {
    const viewContent = fs.readFileSync(actuatorsViewPath, 'utf8');
    expect(viewContent).toContain('api.model.propagateActuator(modelID, idToPropagate, (err,res)=>{');
    expect(viewContent).toContain("$('#modalConfirmation').modal('hide');");
    expect(viewContent).not.toMatch(/api\.model\.propagateActuator[\s\S]*location\.reload\(\);/);
  });
});

describe('device actuators page', () => {
  const actuatorsViewPath = path.join(__dirname, '../../server/public/views/pages/device/actuators.ejs');

  it('writes the actuator value before publishing it over mqtt', () => {
    const viewContent = fs.readFileSync(actuatorsViewPath, 'utf8');
    expect(viewContent).toContain('api.device.updateActuator(deviceId,id,"value",value,(err,res)=>{');
    expect(viewContent).toContain('sendMessage(ref+"/set",String(value));');
  });
});

const fs = require('fs');
const path = require('path');

describe('model firmwares page modal layout', () => {
  const firmwaresViewPath = path.join(__dirname, '../../server/public/views/pages/model/firmwares.ejs');
  const addFirmwareModalPath = path.join(__dirname, '../../server/public/views/partials/modal/addFirmware.ejs');

  it('uses a top-right plus button and modal partial for firmware uploads', () => {
    const viewContent = fs.readFileSync(firmwaresViewPath, 'utf8');
    const modalContent = fs.readFileSync(addFirmwareModalPath, 'utf8');

    expect(viewContent).toContain("<%- include('../../partials/modal/addFirmware.ejs') %>");
    expect(viewContent).toContain('onclick="showAddFirmwareModal()"');
    expect(viewContent).toContain("$('#modalAddFirmware').modal('show');");
    expect(viewContent).not.toContain('<div class="card-header">');

    expect(modalContent).toContain('id="modalAddFirmware"');
    expect(modalContent).toContain('Add new firmware image');
    expect(modalContent).toContain('id="submit_fw"');
  });
});

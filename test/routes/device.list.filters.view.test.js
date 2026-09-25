const fs = require('fs');
const path = require('path');

describe('device list filter views', () => {
  const devicesListViewPath = path.join(__dirname, '../../server/public/views/pages/devices_list.ejs');
  const modelDevicesViewPath = path.join(__dirname, '../../server/public/views/pages/model/devices.ejs');

  it('adds project, model, and variant filters to the main devices list', () => {
    const viewContent = fs.readFileSync(devicesListViewPath, 'utf8');

    expect(viewContent).toContain('<label for="projectFilter" class="form-label">Project</label>');
    expect(viewContent).toContain('<label for="modelFilter" class="form-label">Model</label>');
    expect(viewContent).toContain('<label for="variantFilter" class="form-label">Variant</label>');
    expect(viewContent).toContain("{ elementId: 'projectFilter', columnIndex: 2 }");
    expect(viewContent).toContain("{ elementId: 'modelFilter', columnIndex: 3 }");
    expect(viewContent).toContain("{ elementId: 'variantFilter', columnIndex: 4 }");
    expect(viewContent).toContain("syncDeviceFilters(res || []);");
  });

  it('adds a variant filter to the model devices list', () => {
    const viewContent = fs.readFileSync(modelDevicesViewPath, 'utf8');

    expect(viewContent).toContain('<label for="variantFilter" class="form-label">Variant</label>');
    expect(viewContent).toContain("variantFilter.innerHTML = '<option value=\"\">All variants</option>';");
    expect(viewContent).toContain("applyExactColumnFilter(3, this.value);");
  });
});

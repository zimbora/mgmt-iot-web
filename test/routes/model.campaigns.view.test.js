const path = require('path');
const ejs = require('ejs');
const vm = require('vm');

describe('model campaigns page', () => {
  it('renders campaign controls, safely escapes content, and uses the model API', async () => {
    const html = await ejs.renderFile(path.join(__dirname, '../../server/public/views/pages/model/campaigns.ejs'), {
      model: { id: 2, name: '<script>alert(1)</script>', fw_enabled: true },
      user: { level: 4, name: 'Admin', avatar: '' }, page: 'Campaigns'
    });
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('href="./campaigns"');
    expect(html).toContain('id="campaignDevices" class="form-select mb-3" multiple');
    expect(html).toContain('Latest version (resolved when campaign starts)');
    expect(html).toContain("Settings.api + '/model/'");
    expect(html).toContain("row.insertCell().textContent");
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    scripts.forEach(script => expect(() => new vm.Script(script[1])).not.toThrow());
  });
});

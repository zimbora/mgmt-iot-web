const fotaVersionDetection = require('../../server/public/js/fotaVersionDetection');

describe('fotaVersionDetection', () => {
  it('detects sniffer firmware completion from direct version topic', () => {
    const detection = fotaVersionDetection.getReportedVersions(
      'app/sniffer/3cdc758f41c8/version',
      '2.1.2',
      {
        modelName: 'sniffer',
        deviceUid: '3cdc758f41c8',
        sensors: {
          version: { ref: 'firmware', property: 'version' }
        }
      }
    );

    expect(detection.normalizedTopic).toBe('version');
    expect(detection.newVersion).toBe('2.1.2');
    expect(detection.newAppVersion).toBeNull();
    expect(detection.failureStatus).toBe(false);
  });

  it('detects sniffer firmware completion from firmware payload objects', () => {
    const detection = fotaVersionDetection.getReportedVersions(
      'app/sniffer/3cdc758f41c8/firmware',
      { version: '2.1.2' },
      {
        modelName: 'sniffer',
        deviceUid: '3cdc758f41c8',
        sensors: {
          version: { ref: 'firmware', property: 'version' }
        }
      }
    );

    expect(detection.normalizedTopic).toBe('firmware');
    expect(detection.newVersion).toBe('2.1.2');
    expect(detection.failureStatus).toBe(false);
  });

  it('treats sniffer fota status topic as a failure notification', () => {
    const detection = fotaVersionDetection.getReportedVersions(
      'app/sniffer/3cdc758f41c8/fota/update/status',
      { error: 'download failed' },
      {
        modelName: 'sniffer',
        deviceUid: '3cdc758f41c8',
        sensors: {}
      }
    );

    expect(detection.failureStatus).toBe(true);
    expect(detection.failureMessage).toBe('download failed');
  });

  it('ignores sniffer fota status topic updates that are not failures', () => {
    const detection = fotaVersionDetection.getReportedVersions(
      'app/sniffer/3cdc758f41c8/fota/update/status',
      'downloading',
      {
        modelName: 'sniffer',
        deviceUid: '3cdc758f41c8',
        sensors: {}
      }
    );

    expect(detection.failureStatus).toBe(false);
    expect(detection.newVersion).toBeNull();
    expect(detection.newAppVersion).toBeNull();
  });

  it('does not mistake single-field status payloads for version updates', () => {
    const detection = fotaVersionDetection.getReportedVersions(
      'app/sniffer/3cdc758f41c8/version',
      { status: 'downloading' },
      {
        modelName: 'sniffer',
        deviceUid: '3cdc758f41c8',
        sensors: {
          version: { ref: 'version' }
        }
      }
    );

    expect(detection.failureStatus).toBe(false);
    expect(detection.newVersion).toBeNull();
    expect(detection.newAppVersion).toBeNull();
  });
});

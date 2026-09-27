(function(root) {
  function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    const a = String(v1).split('.').map(Number);
    const b = String(v2).split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function isPrimitiveVersionValue(value) {
    return typeof value === 'string' || typeof value === 'number';
  }

  function extractVersionValue(data, keys) {
    if (isPrimitiveVersionValue(data)) {
      return String(data);
    }

    if (!data || typeof data !== 'object') {
      return null;
    }

    const candidateObjects = [data];
    if (data.data && typeof data.data === 'object') {
      candidateObjects.push(data.data);
    }

    for (const candidate of candidateObjects) {
      for (const key of keys.filter(Boolean)) {
        if (isPrimitiveVersionValue(candidate[key])) {
          return String(candidate[key]);
        }
      }

      const primitiveValues = Object.values(candidate).filter(isPrimitiveVersionValue);
      if (primitiveValues.length === 1) {
        return String(primitiveValues[0]);
      }
    }

    return null;
  }

  function normalizeTopic(topic, modelName, deviceUid) {
    if (modelName !== 'sniffer') {
      return topic;
    }

    if (!deviceUid) {
      return null;
    }

    const index = topic.indexOf(deviceUid);
    if (index < 0) {
      return null;
    }

    return topic.substring(index + deviceUid.length + 1);
  }

  function isFailureStatusMessage(data) {
    if (data && typeof data === 'object') {
      if (typeof data.error === 'string' && data.error.trim() !== '') {
        return true;
      }
    }

    const rawMessage = getStatusMessage(data);
    if (!rawMessage) {
      return false;
    }

    const message = rawMessage.toLowerCase();
    return ['fail', 'error', 'timeout', 'abort', 'denied', 'invalid'].some((token) => message.includes(token));
  }

  function getStatusMessage(data) {
    const rawMessage = extractVersionValue(data, ['status', 'message', 'error', 'payload', 'value']);
    if (rawMessage) {
      return rawMessage;
    }

    if (data && typeof data === 'object') {
      try {
        return JSON.stringify(data);
      } catch (error) {
        return null;
      }
    }

    return data == null ? null : String(data);
  }

  function getReportedVersions(topic, data, options) {
    const normalizedTopic = normalizeTopic(topic, options?.modelName, options?.deviceUid);
    const versionSensor = options?.sensors?.version;
    const appVersionSensor = options?.sensors?.app_version;

    if (
      (normalizedTopic === 'fw/fota/update/status' || normalizedTopic === 'fota/update/status') &&
      isFailureStatusMessage(data)
    ) {
      return {
        normalizedTopic,
        failureStatus: true,
        failureMessage: getStatusMessage(data)
      };
    }

    const newVersion = (
      normalizedTopic === 'version' ||
      normalizedTopic === 'firmware' ||
      normalizedTopic === versionSensor?.ref
    )
      ? extractVersionValue(data, [versionSensor?.property, 'version', 'value', 'payload'])
      : null;

    const newAppVersion = (
      normalizedTopic === 'app_version' ||
      normalizedTopic === appVersionSensor?.ref
    )
      ? extractVersionValue(data, [appVersionSensor?.property, 'app_version', 'value', 'payload'])
      : null;

    return {
      normalizedTopic,
      failureStatus: false,
      failureMessage: null,
      newVersion,
      newAppVersion
    };
  }

  const api = {
    compareVersions,
    extractVersionValue,
    getStatusMessage,
    isFailureStatusMessage,
    normalizeTopic,
    getReportedVersions
  };

  root.FotaVersionDetection = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);

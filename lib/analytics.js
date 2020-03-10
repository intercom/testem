'use strict';

const Amplitude = require('amplitude'); // https://github.com/crookedneighbor/amplitude
const branch = require('git-branch');
const log = require('npmlog');

let amplitude;
if (process.env.AMPLITUDE_KEY) {
  amplitude = new Amplitude(process.env.AMPLITUDE_KEY);
}

const buildAmplitudeEvent = () => {
  let testMetricEvent = {
    platform: process.platform, // the value of process.platform
    branchName: branch.sync(), // git branch name, eg. '22a/test-metrics'
    userEnvVar: process.env.INTERCOM_USER || process.env.USER, // intercomrade username, eg. 'peter.meehan' or 'dev-envs-ad\peter.meehan'
    platformIsCDE: process.platform === 'linux', // true if the test suite is being run on a Cloud Developer Environment
    nodeVersion: process.version,
    testemVersion: require('../package.json').version,
  };

  let amplitudeEvent = {
    eventType: 'ember_test_reload_error',
    userId:
      process.env.INTERCOM_PILOT_KEY ||
      process.env.INTERCOM_USER ||
      process.env.USER ||
      'missing-pilot-key-and-user',
    sessionId: process.env.TEST_METRICS_SCRIPT_START_MS,
    eventProperties: testMetricEvent,
  };
  return amplitudeEvent;
};

module.exports = function trackEvent() {
  if (amplitude) {
    let amplitudeEvent = buildAmplitudeEvent();
    amplitude.track(amplitudeEvent).catch(e => {});
    log.info(`Tracked Amplitude Event: ${amplitudeEvent}`);
  }
};

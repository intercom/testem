'use strict';

const Amplitude = require('amplitude'); // https://github.com/crookedneighbor/amplitude
const branch = require('git-branch');
const amplitude = new Amplitude(process.env.AMPLITUDE_KEY);

const buildAmplitudeEvent = () => {
  let testMetricEvent = {
    platform: process.platform, // the value of process.platform
    branchName: branch.sync(), // git branch name, eg. '22a/test-metrics'
    userEnvVar: process.env.USER, // intercomrade username, eg. 'peter.meehan' or 'dev-envs-ad\peter.meehan'
    platformIsCDE: process.env.USER && process.env.USER.includes('dev-envs-ad'), // true if the test suite is being run on a Cloud Developer Environment
    testemVersion: require('../package.json').version, 
  };

  let amplitudeEvent = {
    eventType: 'ember_test_reload_error',
    userId: process.env.INTERCOM_PILOT_KEY || process.env.USER || 'missing-pilot-key-and-user',
    sessionId: process.env.TEST_METRICS_SCRIPT_START_MS,
    eventProperties: testMetricEvent,
  };
  return amplitudeEvent;
};

module.exports = function trackEvent() {
  let amplitudeEvent = buildAmplitudeEvent();
  amplitude.track(amplitudeEvent).catch(e => {}) 
};

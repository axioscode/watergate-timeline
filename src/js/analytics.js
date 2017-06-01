let AXIOS_VISUEALS_GOOGLE_ANALYTICS_ID;

if (PRODUCTION) {
  AXIOS_VISUALS_GOOGLE_ANALYTICS_ID = ''
} else {
  AXIOS_VISUALS_GOOGLE_ANALYTICS_ID = '';
}

const AXIOS_VISUALS_CATEGORY = ''

// Heavily inspired by our friends at NPR
// https://github.com/nprapps/anno-docs/blob/a3bae37a467217a4e446861a57df7dd49f7570f6/www/js/analytics.js

var embedGa = function() {
    (function(i,s,o,g,r,a,m) {
        i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
}

var setupVisualsAnalytics = function() {
    ga('create', AXIOS_VISUALS_GOOGLE_ANALYTICS_ID, 'auto');

    // By default Google tracks the query string, we want to ignore it.
    var location = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
    ga('set', 'location', location);
    ga('set', 'page', window.location.pathname);

    // Track Pageview
    ga('send', 'pageview');
}

var setupVisualsGoogleAnalytics = function() {
  embedGa();
  setupVisualsAnalytics();
}

var trackEvent = function(action, label, value) {
  var eventData = {
      'hitType': 'event',
      'eventCategory': AXIOS_VISUALS_CATEGORY,
      'eventAction': action
  }

  // an optional string
  if (label) { eventData['eventLabel'] = label; }
  // an optional integer
  if (value) { eventData['eventValue'] = value; }

  ga('send', eventData);
}

module.exports = { setupVisualsGoogleAnalytics,trackEvent }

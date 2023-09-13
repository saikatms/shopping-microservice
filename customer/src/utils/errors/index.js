const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const {
    NotFoundError,
    ValidationError,
    AuthorizeError,
  } = require("./app-errors");
  
Sentry.init({
  dsn: 'https://b08ed4667397809ab6bcdfe393a2a1a4@o4505873170694144.ingest.sentry.io/4505873180459008',
  integrations: [
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});


module.exports = (app) => {
    app.use((error, req, res, next) => {
      let reportError = true;
  
      // skip common / known errors
      [NotFoundError, ValidationError, AuthorizeError].forEach((typeOfError) => {
        if (error instanceof typeOfError) {
          reportError = false;
        }
      });
  
      if (reportError) {
        Sentry.captureException(error);
      }
      const statusCode = error.statusCode || 500;
      const data = error.data || error.message;
      return res.status(statusCode).json(data);
    });
};
// Use Sentry for error tracking only (no profiling)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://af49cd78e34e869e5c3fcd47018a17dc@o4508646666141696.ingest.us.sentry.io/4508646670663680",
  sendDefaultPii: true, // optional: captures user info and IP addresses
  // tracesSampleRate: 1.0, // optional: enable if you want tracing
});

// Example: manually capture an error
// Sentry.captureException(new Error("Test error"));

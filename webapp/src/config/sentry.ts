import { BrowserTracing } from "@sentry/tracing";
import * as Sentry from "@sentry/react";
import { __prod__ } from "../utils/constants";

Sentry.init({
  dsn: "https://a8685f711258478ea98aa8c893908e27@o1187852.ingest.sentry.io/6307711",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  environment: __prod__ ? "production" : "dev",
});

import { captureException } from "@sentry/node";

import { startService } from "./service";

startService().catch((error) => {
    console.error(error);
    captureException(error);
    process.exit(1);
});

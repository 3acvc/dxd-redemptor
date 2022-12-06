import * as Sentry from "@sentry/node";
import * as chalk from "chalk";
import Mongoose from "mongoose";

import { createBareHapiServer, configure } from "./server";

export async function startService() {
  if (process.env.SENTRY_DSN) {
    // initilize Sentry
    Sentry.init({
      attachStacktrace: true,
      environment: process.env.NODE_ENV,
      dsn: process.env.SENTRY_DSN,
    });
  } else {
    console.warn(chalk.yellowBright("Sentry: Sentry is not configured"));
  }

  // Mongoose watchdog
  Mongoose.connection.on("error", (error) => {
    Sentry.captureException(error);
    process.exit(100);
  });

  // Mongo connect
  if (!process.env.MONGO_URI) {
    console.error(chalk.redBright("Mongo: process.env.MONGO_URI is missing"));
    process.exit(1);
  }

  await Mongoose.connect(process.env.MONGO_URI as string, {});

  Mongoose.set("debug", process.env.MONGO_DEBUG === "true");

  const server = createBareHapiServer();

  const configuredServer = await configure(server);

  await configuredServer.start();

  console.log(
    chalk.greenBright(
      `Aggregator: Server is listening on port ${process.env.SERVER_PORT}`
    )
  );
}

import * as Sentry from '@sentry/node';
import chalk from 'chalk';

import { createBareHapiServer } from '../lib/server';

import { configure } from './server';

export async function startService() {
  // Require the private key of the signer
  if (!process.env.SIGNER_PRIVATE_KEY) {
    throw new Error('SIGNER_PRIVATE_KEY is missing');
  }

  if (process.env.SENTRY_DSN) {
    // initilize Sentry
    Sentry.init({
      attachStacktrace: true,
      environment: process.env.NODE_ENV,
      dsn: process.env.SENTRY_DSN,
    });
  } else {
    console.warn(chalk.yellowBright('Sentry: Sentry is not configured'));
  }

  const server = createBareHapiServer();

  const configuredServer = await configure(server);

  await configuredServer.start();

  console.log(
    chalk.greenBright(
      `Verifier: Server is listening on port ${process.env.SERVER_PORT}`
    )
  );
}


import { join } from "path";

import { HandlerDecorations, Server } from "@hapi/hapi";
import * as inert from "@hapi/inert";
import * as vision from "@hapi/vision";
// @ts-ignore
import hapiRateLimit from "hapi-rate-limit";
import * as hapiSwagger from "hapi-swagger";
import * as Joi from "joi";

import {
  getOrderQuotePayloadController,
  registerSignerController,
} from "./controllers";

/**
 * Creates a new Hapi Auth Server with the following config
 * - port = `SERVER_PORT` and host `SERVER_HOST`
 * - All routes support CORS and not authentication required
 * @returns Server
 */
export function createBareHapiServer(): Server {
  return new Server({
    port: process.env.SERVER_PORT,
    host: process.env.SERVER_HOST,
    routes: {
      auth: false,
      cors: {
        origin: ["*"],
      },
    },
    debug: {
      request: ["*"],
      log: ["*"],
    },
  });
}

/**
 * Configures the server object
 * - Adds Joi as default validation engine
 * - Sets rate limit in production
 * - Register routes
 */
export async function configure(server: Server): Promise<Server> {
  // Register Joi
  await server.validator(Joi);
  // Rate-limit in production
  if (process.env.NODE_ENV === "production") {
    await server.register({
      plugin: hapiRateLimit,
      options: {
        userLimit: 60000,
      },
    });
  }

  // Register routes
  server.route([
    {
      method: "POST",
      path: "/signer/register",
      handler: registerSignerController as HandlerDecorations,
    },
    {
      method: "POST",
      path: "/redeem/quote",
      handler: getOrderQuotePayloadController as HandlerDecorations,
    },
  ]);

  const swaggerBasePathProd =
    process.env.NODE_ENV === "production" ? join("/") : "/";

  const swaggerOptions: hapiSwagger.RegisterOptions = {
    info: {
      title: "DXdao Redeemption API Documentation",
    },
    debug: true,
    deReference: true, // works better with codegens
    // // reverse proxy support
    documentationPath: join(swaggerBasePathProd, "/docs"),
    swaggerUIPath: join(swaggerBasePathProd, "/swaggerui/"),
    jsonPath: join(swaggerBasePathProd, "/swagger.json"),
    basePath: join(swaggerBasePathProd, "/"),
  };

  console.log("[Swagger] swaggerOptions", swaggerOptions);

  // Register Swagger
  await server.register([
    { plugin: inert },
    { plugin: vision },
    { plugin: hapiSwagger, options: swaggerOptions },
  ]);

  // Return configured server
  return server;
}

import { config } from "dotenv";
import { getEnv, getRequiredEnv } from "./utils/env";

const production = getEnv("NODE_ENV") === "production";
if (!production) {
    config();
}

import { join } from "path";
import { HandlerDecorations, Server } from "@hapi/hapi";
import * as inert from "@hapi/inert";
import * as vision from "@hapi/vision";
// eslint-disable-next-line
// @ts-ignore
import hapiRateLimit from "hapi-rate-limit";
import * as hapiSwagger from "hapi-swagger";
import * as Joi from "joi";

import { verifyAndSignOracleAggreagatorMessageController } from "./controllers";

const serverPort = getRequiredEnv("SERVER_PORT");

async function main() {
    const server = new Server({
        port: serverPort,
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
    server.route({
        method: "POST",
        path: "/verify",
        handler: verifyAndSignOracleAggreagatorMessageController as HandlerDecorations,
        options: {
            description: "Verify and sign a message from the Oracle Aggregator",
            validate: {
                payload: Joi.object({
                    quote: Joi.object({
                        redeemedDXD: Joi.string().required(),
                        circulatingDXDSupply: Joi.string().required(),
                        redeemedToken: Joi.string().required(),
                        redeemedTokenUSDPrice: Joi.string().required(),
                        redeemedAmount: Joi.string().required(),
                        collateralUSDValue: Joi.string().required(),
                        deadline: Joi.string().required(),
                    }),
                    blockNumber: Joi.object().keys({
                        "1": Joi.number().required(),
                        "100": Joi.number().required(),
                    }),
                }),
                failAction: (_req, _h, err) => {
                    console.log(err);
                    throw err;
                },
            },

            tags: ["api", "verify"],
        },
    });

    const swaggerBasePathProd = production ? join("/") : "/";

    const swaggerOptions: hapiSwagger.RegisterOptions = {
        info: {
            title: "DXdao DXD redemptor API Documentation: Verifier Node",
        },
        debug: true,
        deReference: true,
        documentationPath: join(swaggerBasePathProd, "/docs"),
        swaggerUIPath: join(swaggerBasePathProd, "/swaggerui/"),
        jsonPath: join(swaggerBasePathProd, "/swagger.json"),
        basePath: join(swaggerBasePathProd, "/"),
    };

    await server.register([
        { plugin: inert },
        { plugin: vision },
        { plugin: hapiSwagger, options: swaggerOptions },
    ]);

    console.log("[Swagger] swaggerOptions", swaggerOptions);

    await server.start();

    console.log(`Verifier: Server is listening on port ${serverPort}`);
}

main().catch(console.error);

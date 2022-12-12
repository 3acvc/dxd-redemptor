import { config } from "dotenv";
import { getEnv, getRequiredEnv } from "./utils/env";

const production = getEnv("NODE_ENV") === "production";
if (!production) {
    config();
}

import { HandlerDecorations, Server } from "@hapi/hapi";
import { greenBright } from "chalk";
import Mongoose from "mongoose";
import Joi from "joi";
import * as inert from "@hapi/inert";
import * as vision from "@hapi/vision";
import hapiSwagger, { RegisterOptions } from "hapi-swagger";
import { join } from "path";
import {
    handleGetRegisterationMessage,
    handleRegister,
} from "./controllers/register";
import { handleQuote } from "./controllers/quote";
import { VerifierModel } from "./models/verifier";

const mongoUri = getRequiredEnv("MONGO_URI");
const mongoDebug = getEnv("MONGO_DEBUG") === "true";
const serverPort = getRequiredEnv("SERVER_PORT");

// TODO: add rate limiting
const main = async () => {
    Mongoose.connection.on("error", (error) => {
        console.error(error);
        process.exit(100);
    });
    await Mongoose.connect(mongoUri, {});
    Mongoose.set("debug", mongoDebug);

    const server = new Server({
        host: "localhost",
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

    await server.validator(Joi);

    server.route([
        {
            method: "POST",
            path: "/verifiers/register",
            options: {
                handler: handleRegister as HandlerDecorations,
                description: "Registers a signer",
                notes:
                    "Registers a signer whitelisted on the redemptions contract",
                tags: ["api"],
                validate: {
                    payload: Joi.object({
                        signature: Joi.string()
                            .required()
                            .description("A signed registration message"),
                        endpoint: Joi.string()
                            .required()
                            .description(
                                "The endpoint at which the verifier will respond"
                            ),
                    }),
                },
            },
        },
        {
            method: "GET",
            path: "/verifiers/message",
            options: {
                handler: handleGetRegisterationMessage as HandlerDecorations,
                description:
                    "Gets the registration message which must be signed",
                tags: ["api"],
            },
        },
        {
            method: "GET",
            path: "/quote",
            options: {
                handler: handleQuote as HandlerDecorations,
                description: "Gets a redemption quote",
                notes:
                    "Computes and returns a signed and verified quote for a redemption",
                tags: ["api"],
                validate: {
                    query: Joi.object({
                        redeemedDXD: Joi.string()
                            .required()
                            .description("The amount of redeemed DXD"),
                        redeemedToken: Joi.string()
                            .required()
                            .description("The token to redeem DXD for"),
                    }),
                },
            },
        },
    ]);

    if (!production) {
        const address = "0xD51d4b680Cd89E834413c48fa6EE2c59863B738d";
        console.log("Reigstering default signer");

        await VerifierModel.findOneAndUpdate(
            {
                address,
            },
            {
                address,
                endpoint: "http://localhost:4001",
            },
            { upsert: true }
        );

        console.log("Default signer registered");
    }

    const swaggerBasePathProd = production ? join("/") : "/";

    const swaggerOptions: RegisterOptions = {
        info: {
            title: "DXdao DXD redemptor API Documentation: Aggregator Node",
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
    await server.start();

    console.log(greenBright(`Server is listening on port ${serverPort}`));
};

main().catch(console.error);

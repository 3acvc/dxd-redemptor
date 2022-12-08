#!/usr/bin/env node

import { JsonRpcProvider } from "@ethersproject/providers";
import { isAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import ora from "ora";
import { program } from "commander";
import {
    DXDAO_MAINNET_AVATAR,
    PORT,
    REDEMPTOR_CONTRACT,
    require,
} from "./commons.js";

const provider = new JsonRpcProvider(`http://localhost:${PORT}`);
let dxdaoAvatarSigner;
try {
    dxdaoAvatarSigner = await provider.getSigner(DXDAO_MAINNET_AVATAR);
} catch (error) {
    console.error(
        "Couldn't get DXdao mainnet avatar signer, is the fork running?",
        error
    );
    process.exit(1);
}
const redemptor = new Contract(
    REDEMPTOR_CONTRACT,
    require("../out/Redemptor.sol/Redemptor.json").abi,
    dxdaoAvatarSigner
);

program
    .name("fork-interact")
    .description(
        "Utility CLI program to interact with the redemptor local fork"
    );

program
    .command("whitelist-signer <address>")
    .description("Whitelists the specified signer")
    .action(async (address) => {
        if (!isAddress(address)) program.error("invalid address");
        const spinner = ora();
        spinner.start(`Whitelisting signer ${address}`);
        try {
            await redemptor.addSigners([address]);
            spinner.succeed(`Signer ${address} successfully whitelisted`);
        } catch (error) {
            spinner.fail(
                `Failed to whitelist signer ${address}, is the fork running?`
            );
            console.log();
            console.log(error);
        }
    });

program.parse();

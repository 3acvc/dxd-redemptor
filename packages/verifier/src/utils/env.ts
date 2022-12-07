import { redBright } from "chalk";

export const getRequiredEnv = (key: string): string => {
    const value = process.env[key] as string;
    if (!value) {
        console.error(redBright(`${key} env is required`));
        process.exit(1);
    }
    return value;
};

export const getEnv = (key: string): string => {
    return process.env[key] as string;
};

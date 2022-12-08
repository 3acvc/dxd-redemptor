const isProduction: boolean = process.env.NODE_ENV === "production";

export function enforce(
    condition: boolean,
    message: string
): asserts condition {
    if (!condition) throw new Error(isProduction ? undefined : message);
}

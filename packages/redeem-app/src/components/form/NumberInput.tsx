import { InputHTMLAttributes } from "react";

interface NumberInputProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "onChange" | "pattern" | "type"
    > {
    onChange: (value: string) => void;
}

export function NumberInput({ onChange, ...props }: NumberInputProps) {
    return (
        <input
            {...props}
            type="number"
            pattern="^-?[0-9]\d*\.?\d*$"
            onChange={(e) => {
                const value = e.target.value.replace(/-|e/gi, "");
                onChange(value);
            }}
        />
    );
}

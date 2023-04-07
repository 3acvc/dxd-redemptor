import { Input, InputComponentProps } from "ui/components/Input";

interface NumberInputProps extends Omit<InputComponentProps, "onChange"> {
  onUserInput: (input: string) => void;
  border?: boolean;
  value: string | number;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function NumberInput({
  value,
  border = true,
  onUserInput,
  ...props
}: NumberInputProps) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={(event) => {
        enforcer(event.target.value.replace(/,/g, "."));
      }}
      // universal input options
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={"0"}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  );
}

export function TextInput({ onUserInput, ...props }: NumberInputProps) {
  return (
    <Input
      {...props}
      type="text"
      onChange={(e) => {
        onUserInput(e.target.value);
      }}
    />
  );
}

import { InputHTMLAttributes, useCallback, useState } from "react";
import styled from "styled-components";
import {
  border,
  borderRadius,
  marginBottom8,
  backgroundColorDark as backgroundColor,
  textColorDark as textColor,
} from "../base/constants";

type InputShadowWrapperProps = {
  $marginBottom?: boolean;
  isFocused?: boolean;
};

export type InputComponentProps = InputHTMLAttributes<HTMLInputElement> &
  InputShadowWrapperProps;

/**
 * A simple JSX input component
 * @param props
 * @returns
 */
export function Input({ $marginBottom, ...props }: InputComponentProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <InputShadowWrapper $marginBottom={$marginBottom} isFocused={isFocused}>
      <StyledInput onFocus={handleFocus} onBlur={handleBlur} {...props} />
    </InputShadowWrapper>
  );
}

export const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  ${backgroundColor}
  ${textColor}
  /** Handled by StyledInputShadowWrapper */
  &,
  &:focus,
  &:active {
    outline: none;
    border: none;
  }
`;

/**
 * Adds a shadow to the input
 */
const InputShadowWrapper = styled.div<InputShadowWrapperProps>(
  (props) => `
  width: 100%;
  overflow: hidden;
  height: 40px;
  ${border}
  ${borderRadius}
  ${backgroundColor}
  ${textColor}
  transition: border-color 0.2s ease-in-out;
  border-color: #646669;

    ${
      props.isFocused === true
        ? `border-color: #12ff80 !important;`
        : `&:hover {
            border-color: #fff;
          }
          `
    }
  ${props.$marginBottom === true ? `${marginBottom8}` : ""}

  `
);

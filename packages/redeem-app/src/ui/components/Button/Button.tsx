import styled from "styled-components";

import { border, borderRadius } from "../base/constants";

interface ButtonProps {
  $minWidth?: string;
}

export const DefaultButton = styled.button<ButtonProps>(
  ({ $minWidth }) => `
  ${border}
  ${borderRadius}
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  background: #12ff80;
  border-color: #12ff80;
  color: #fff;
  height: 50px;
  transition: all 0.2s ease-in-out;
  color: #000;
  line-height: 18px;
  height: 40px;
  &:hover {
    transform: translateY(-2px);
  }
  ${$minWidth ? `min-width: ${$minWidth};` : ""}
`
);

/**
 * What the name suggests
 */
export const WhiteButton = styled(DefaultButton)`
  background: #fff;
`;

/**
 * Use this for secondary actions like "No" in a modal
 */
export const FaintButton = styled(DefaultButton)`
  background: #fbf4e6;
  box-shadow: none;
`;

/**
 * Alias for the default button
 */
export const PrimaryButton = styled(DefaultButton)``;

/**
 * A text button with underline decoration. You can use this for small text like CTA helper under a field
 */
export const TextButton = styled.button<{ alignRight?: boolean }>(
  (props) => `
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  text-decoration: underline;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  ${props.alignRight ? "margin-left: auto; text-align:right;" : ""}
  &:hover {
    color: #000;
  }
`
);

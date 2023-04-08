import { PropsWithChildren } from "react";
import styled from "styled-components";

import { backgroundColorDark, borderRadius } from "../base/constants";

interface CardProps {
  $width?: string;
  $height?: string;
  $minHeight?: string;
}

export const StyledCardGutter = styled.div<CardProps>(
  (props) => `
  ${props.$width ? `width: ${props.$width};` : ""}
  ${props.$height ? `height: ${props.$height};` : ""}
  ${props.$minHeight ? `min-height: ${props.$minHeight};` : ""}
`
);

/**
 * Access low level styles of the Card
 */
export const StyledCard = styled.div<CardProps>(
  (props) => `
  position: relative;
  ${backgroundColorDark}
  ${borderRadius}
  margin-bottom: 8px;
  ${props.$width ? `width: ${props.$width};` : ""}
  ${props.$height ? `height: ${props.$height};` : ""}
  ${props.$minHeight ? `min-height: ${props.$minHeight};` : ""}
`
);

export function Card(props: PropsWithChildren<CardProps>) {
  return (
    <StyledCardGutter $height={props.$height} $width={props.$width}>
      <StyledCard {...props}>{props.children}</StyledCard>
    </StyledCardGutter>
  );
}

interface CardInnerWrapperProps {
  $minHeight?: string;
}

export const CardInnerWrapper = styled.div<CardInnerWrapperProps>(
  (props) => `
  position: relative;
  width: 100%;
  height: 100%;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  ${props.$minHeight ? `min-height: ${props.$minHeight};` : ""}
`
);

/**
 * Card Title, used in Card component
 */
export const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 1rem;
`;

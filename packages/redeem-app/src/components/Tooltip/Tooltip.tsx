import { ReactNode } from "react";
import styled from "styled-components";
import { backgroundColorDark } from "ui/components/base/constants";

import { ReactComponent as TooltipSVG } from "assets/svg/tooltip.svg";

export function Tooltip({
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <StyledTooltipContainer>
      <TooltipSVG />
      <StyledTooltipText>{content}</StyledTooltipText>
    </StyledTooltipContainer>
  );
}

const StyledTooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  max-width: 256px;
  cursor: default;
  padding: 0.6rem 1rem;
  pointer-events: auto;
  &:hover span {
    visibility: visible;
    opacity: 1;
  }
`;

const StyledTooltipText = styled.span`
  visibility: hidden;
  min-width: 60px;
  max-width: 180px;
  background-color: #121312;
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 12px;
  position: absolute;
  z-index: 1;
  bottom: 40px;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  user-select: none;
  font-size: 12px;
`;

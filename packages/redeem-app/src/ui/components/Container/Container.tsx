import { PropsWithChildren } from 'react';
import styled from 'styled-components';

/**
 * Max width of the container.
 */
const CONTAINER_MAX_WIDTH = '1300px';

interface ContainerProps {
  /**
   * Fluid container will not have a max width.
   */
  $fluid?: boolean;
  /**
   * Max width of the container. Defaults to 1200px.
   */
  $maxWidth?: string;
}

export const Container = styled.div<ContainerProps>(
  (props) => `
  height: 100%;
  margin: 0 auto;
  ${props.$fluid ? '' : `max-width: ${props.$maxWidth ? props.$maxWidth : CONTAINER_MAX_WIDTH};`}
  padding: 0 16px;
  width: 100%;
`
);

export const FlexContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export function ContainerHeader({
  title,
  children,
}: PropsWithChildren<{
  /**
   * Title to display. If not provided, the title will not be displayed.
   */
  title?: string;
}>) {
  return (
    <StyledHeaderWrapper>
      {title && <StyledTitle>{title}</StyledTitle>}
      <StyledHeaderButtonsWrapper>{children}</StyledHeaderButtonsWrapper>
    </StyledHeaderWrapper>
  );
}

const StyledHeaderButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 8px;
  @media (min-width: 768px) {
    flex-direction: row;
    margin-bottom: 0;
  }
`;

const StyledHeaderWrapper = styled.header`
  width: 100%;
  display: flex;
  padding: 0px;
  margin-bottom: 8px;
  flex-direction: column;
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const StyledTitle = styled.h1`
  flex: 1;
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  padding: 8px 0;
`;

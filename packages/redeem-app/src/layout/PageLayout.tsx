import { PropsWithChildren } from "react";
import styled from "styled-components";

import { Footer, FOOTER_HEIGHT } from "components/Footer";
import { Header, HEADER_HEIGHT } from "components/Header";

export function PageLayout({
  children,
  contentLayout = "default",
}: PropsWithChildren<{
  contentLayout?: "default" | "flex-center";
}>) {
  return (
    <Container>
      <Header />
      <Content $contentLayout={contentLayout}> {children}</Content>
      <Footer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const Content = styled.main<{
  $contentLayout?: "default" | "flex-center";
  $fixedHeader?: boolean;
}>(
  ({ $contentLayout, $fixedHeader }) => `
  width: 100%;
  margin: 0 auto;
  min-height:  calc(100vh - (${HEADER_HEIGHT} + ${FOOTER_HEIGHT})); /** 100vh - (header + footer) */
  flex: 1; /* to fill the remaining space */
  ${$fixedHeader ? `padding-top: ${HEADER_HEIGHT};` : ""}
  ${
    $contentLayout === "flex-center"
      ? `display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `
      : ""
  }
`
);

export const PageHeader = styled.header`
  margin-bottom: 2rem;
`;

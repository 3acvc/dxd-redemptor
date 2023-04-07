import styled from "styled-components";

import { ReactComponent as ThreeACLogo } from "assets/3ac-logo.svg";

export const FOOTER_HEIGHT = "64px";

export function Footer() {
  return (
    <FooterWrapper>
      <a href="https://3ac.vc" target="_blank" rel="noopener noreferrer">
        <ThreeACLogo width={120} />
      </a>
    </FooterWrapper>
  );
}

const FooterLink = styled.a`
  :active,
  :focus,
  :visited {
    color: #000;
    text-decoration: none;
  }
  :hover {
    text-decoration: underline;
  }
  font-size: 12px;
  font-weight: bold;
`;

const FooterTitle = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const FooterWrapper = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  color: #000;
  height: ${FOOTER_HEIGHT};
`;

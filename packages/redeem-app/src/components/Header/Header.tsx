import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { ReactComponent as Burger } from "./burger.svg";

import logoURL from "assets/3ac-logo.svg";

import { Container, padding } from "ui/components/Container";
import { borderRadius } from "ui/components/base/constants";
import { WalletConnectButton } from "components/form/WalletConnectButton";

export const HEADER_HEIGHT = "88px"; // 4px * 22
export const TOGGLE_BUTTON_SIZE = "50px";
export const DESKTOP_BREAKPOINT = "768px";
export const ASIDE_BACKGROUND_COLOR = "#1c1c1c";
const SIDE_COMPONENTS_MAX_WIDTH = "200px";

// Use a variable in case of rebranding
const title = "3AC";

function NavMenuItems() {
  return (
    <>
      <HeaderTitleContainer>
        <Link to="/">
          <img src={logoURL} alt={title} width="60" height="40" />
        </Link>
      </HeaderTitleContainer>
      <Nav>
        <Link to="/" title="Redeem">
          Redeem
        </Link>
        <Link to="/nav" title="View NAV">
          NAV
        </Link>
      </Nav>
      <WalletConnectButtonContainer>
        <WalletConnectButton children={<></>} />
      </WalletConnectButtonContainer>
    </>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HeaderFrame>
      <SidebarToggle onClick={() => setIsOpen(!isOpen)}>
        <Burger />
      </SidebarToggle>
      {isOpen && <SidebarToggleOverlay onClick={() => setIsOpen(false)} />}
      <Aside isOpen={isOpen}>
        <NavMenuItems />
      </Aside>
      <Container $fluid={true}>
        <HeaderNav>
          <NavMenuItems />
        </HeaderNav>
      </Container>
    </HeaderFrame>
  );
}

const SidebarToggle = styled.button`
  display: block;
  background: #000;
  color: #fff;
  outline: none;
  border: 0;
  font-weight: bold;
  text-transform: uppercase;
  position: fixed;
  ${borderRadius};
  right: ${padding};
  top: ${padding};
  z-index: 1000;
  width: ${TOGGLE_BUTTON_SIZE};
  height: ${TOGGLE_BUTTON_SIZE};
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    display: none;
  }
`;

const SidebarToggleOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(1px);
  z-index: 1047;
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    display: none;
  }
`;

const WalletConnectButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  /** Bottom spacing for mobile nav */
  margin-bottom: 32px;
  max-width: ${SIDE_COMPONENTS_MAX_WIDTH};
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    margin-bottom: 0;
    width: ${SIDE_COMPONENTS_MAX_WIDTH};
    max-width: ${SIDE_COMPONENTS_MAX_WIDTH};
  }
`;

const Aside = styled.aside<{ isOpen: boolean }>(
  (props) => `
  display: flex;
  align-items: stretch;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  background: ${ASIDE_BACKGROUND_COLOR};
  width: 300px;
  height: 100%;
  position: fixed;
  z-index: 1048;
  top: 0;
  left: 0;
  border-right: 2px solid #000;
  padding: 32px 0;
  transform: translateX(${props.isOpen ? "0" : "-100%"});
  transition: transform 0.3s ease-in-out;
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    display: none;
  }
`
);

const HeaderTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  width: 100%;
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    width: ${SIDE_COMPONENTS_MAX_WIDTH};
    max-width: ${SIDE_COMPONENTS_MAX_WIDTH};
    justify-content: flex-start;
  }
`;

const HeaderFrame = styled.header`
  height: ${HEADER_HEIGHT};
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    width: 100%;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  justify-content: start;
  gap: 16px;
  width: 100%;

  /** On dekstop, we want the nav to be on the right */
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    flex-direction: row;
    justify-content: end;
  }

  & > a {
    text-decoration: none;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
    padding: 16px 24px;
    display: block;
    border-radius: 0;
    border: 0;
    font-size: 14px;
  }

  & > a:hover {
    text-decoration: underline;
  }
`;

const HeaderNav = styled.nav`
  /** Hidden on mobile */
  display: none;
  align-items: stretch;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  background: transparent;
  z-index: 1000;
  position: relative;
  width: 100%;
  height: 100%;
  @media (min-width: ${DESKTOP_BREAKPOINT}) {
    display: flex;
    flex-direction: row;
  }

  ${Nav} {
    width: auto;
    flex: none;
  }
`;

import styled from "styled-components";

import { ReactComponent as ThreeACLogo } from "../assets/3ac-logo.svg";

export function Footer() {
    return (
        <FooterWrapper>
            <a href="https://3ac.vc" target="_blank" rel="noopener noreferrer">
                <ThreeACLogo width={120} />
            </a>
        </FooterWrapper>
    );
}

const FooterWrapper = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    font-size: 0.8rem;
    color: #000;
`;

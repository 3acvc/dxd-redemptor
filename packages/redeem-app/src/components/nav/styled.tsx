import { Loader, LoaderWrapper } from "components/Loader";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";
import styled from "styled-components";

export const CardInnerWrapperLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export function MotionOpacity({ children }: PropsWithChildren) {
  return (
    <StyledMotionDiv
      initial="collapsed"
      animate="open"
      exit="collapsed"
      variants={{
        open: { opacity: 1, height: "auto" },
        collapsed: { opacity: 0, height: 0 },
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </StyledMotionDiv>
  );
}

export function MotionOpacityLoader() {
  return (
    <StyledMotionLoaderDiv
      initial="collapsed"
      animate="open"
      exit="collapsed"
      variants={{
        open: { opacity: 1, height: "auto" },
        collapsed: { opacity: 0, height: 0 },
      }}
      transition={{ duration: 0.2 }}
    >
      <Loader stroke="#fff" />
    </StyledMotionLoaderDiv>
  );
}

const StyledMotionDiv = styled(motion.div)`
  width: 100%;
  height: 100%;
  flex-grow: 1;
`;

const StyledMotionLoaderDiv = styled(motion.div)`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

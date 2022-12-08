import styled from 'styled-components'

export const ModalSection = styled.div`
  display: flex;
  flex-direction: column;
`

export const ModalContent = styled(ModalSection)`
  align-items: center;
  background: #fff;
  padding: 24px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  overflow-y: hidden;
  z-index: 100;

  /** Inner layout */
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ModalOutterWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

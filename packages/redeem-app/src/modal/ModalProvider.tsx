import {
  PropsWithChildren,
  useCallback,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";

import { ConnectWalletModal } from "components/Modal/ConnectWalletModal";
import { Modal } from "./constants";

export interface IModalContext<ModalData = unknown> {
  modal: Modal | null;
  /**
   * If you want to pass data to the modal, you can do so here.
   * @param modal The modal to open
   * @param data The data to pass to the modal
   * @returns
   */
  openModal: (modal: Modal, data?: ModalData) => void;
  setModalData: Dispatch<SetStateAction<ModalData>>;
  closeModal: () => void;
  data: ModalData | null;
}

export const ModalContext = createContext({
  modal: null,
  openModal: () => {},
  closeModal: () => {},
  setModalData: () => {},
  data: null,
} as IModalContext);

export function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<Modal | null>(null);
  const [data, setData] = useState<unknown>(null);

  const openModal = useCallback((modal: Modal, data?: unknown) => {
    setModal(modal);
    setData(data);
  }, []);

  const setModalData = useCallback((data: unknown) => {
    setData(data);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        modal,
        data,
        openModal,
        closeModal,
        setModalData,
      }}
    >
      <ConnectWalletModal />

      {children}
    </ModalContext.Provider>
  );
}

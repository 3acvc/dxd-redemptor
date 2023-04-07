import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { WalletProvider } from "wallet";
import { ModalProvider } from "modal";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </WalletProvider>
  </React.StrictMode>
);

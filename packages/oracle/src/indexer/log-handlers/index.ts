import { Log } from "@ethersproject/abstract-provider";
import { WebSocketProvider } from "@ethersproject/providers";
import { ChainId } from "../../constants";
import { handle as ethereumHandler } from "./ethereum";
import { handle as gnosisHandler } from "./gnosis";

type LogHandler = (
    providerList: Record<ChainId, WebSocketProvider>,
    log: Log
) => void;

export const LOG_HANDLERS: Record<ChainId, LogHandler> = {
    [ChainId.ETHEREUM]: ethereumHandler,
    [ChainId.GNOSIS]: gnosisHandler,
};

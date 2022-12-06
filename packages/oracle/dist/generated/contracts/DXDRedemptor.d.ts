import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export type OracleMessageStruct = {
    redeemedDXD: PromiseOrValue<BigNumberish>;
    circulatingDXDSupply: PromiseOrValue<BigNumberish>;
    redeemedToken: PromiseOrValue<string>;
    redeemedTokenUSDPrice: PromiseOrValue<BigNumberish>;
    redeemedAmount: PromiseOrValue<BigNumberish>;
    collateralUSDValue: PromiseOrValue<BigNumberish>;
};
export type OracleMessageStructOutput = [
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber
] & {
    redeemedDXD: BigNumber;
    circulatingDXDSupply: BigNumber;
    redeemedToken: string;
    redeemedTokenUSDPrice: BigNumber;
    redeemedAmount: BigNumber;
    collateralUSDValue: BigNumber;
};
export interface DXDRedemptorInterface extends utils.Interface {
    functions: {
        "addSigners(address[])": FunctionFragment;
        "domainSeparator()": FunctionFragment;
        "isSigner(address)": FunctionFragment;
        "redeem((uint256,uint256,address,uint256,uint256,uint256),bytes[])": FunctionFragment;
        "removeSigners(address[])": FunctionFragment;
        "setSignersThreshold(uint16)": FunctionFragment;
        "signersAmount()": FunctionFragment;
        "signersThreshold()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addSigners" | "domainSeparator" | "isSigner" | "redeem" | "removeSigners" | "setSignersThreshold" | "signersAmount" | "signersThreshold"): FunctionFragment;
    encodeFunctionData(functionFragment: "addSigners", values: [PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "domainSeparator", values?: undefined): string;
    encodeFunctionData(functionFragment: "isSigner", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "redeem", values: [OracleMessageStruct, PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "removeSigners", values: [PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "setSignersThreshold", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "signersAmount", values?: undefined): string;
    encodeFunctionData(functionFragment: "signersThreshold", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addSigners", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "domainSeparator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isSigner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeSigners", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setSignersThreshold", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "signersAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "signersThreshold", data: BytesLike): Result;
    events: {
        "AddSigners(address[])": EventFragment;
        "Redeem(uint256,uint256,address,uint256,uint256,uint256,bytes[])": EventFragment;
        "RemoveSigners(address[])": EventFragment;
        "SetSignersThreshold(uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddSigners"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Redeem"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemoveSigners"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SetSignersThreshold"): EventFragment;
}
export interface AddSignersEventObject {
    addedSigners: string[];
}
export type AddSignersEvent = TypedEvent<[string[]], AddSignersEventObject>;
export type AddSignersEventFilter = TypedEventFilter<AddSignersEvent>;
export interface RedeemEventObject {
    redeemedDXD: BigNumber;
    circulatingDXDSupply: BigNumber;
    redeemedToken: string;
    redeemedTokenUSDPrice: BigNumber;
    redeemedAmount: BigNumber;
    collateralUSDValue: BigNumber;
    signatures: string[];
}
export type RedeemEvent = TypedEvent<[
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string[]
], RedeemEventObject>;
export type RedeemEventFilter = TypedEventFilter<RedeemEvent>;
export interface RemoveSignersEventObject {
    removedSigners: string[];
}
export type RemoveSignersEvent = TypedEvent<[
    string[]
], RemoveSignersEventObject>;
export type RemoveSignersEventFilter = TypedEventFilter<RemoveSignersEvent>;
export interface SetSignersThresholdEventObject {
    signersThreshold: BigNumber;
}
export type SetSignersThresholdEvent = TypedEvent<[
    BigNumber
], SetSignersThresholdEventObject>;
export type SetSignersThresholdEventFilter = TypedEventFilter<SetSignersThresholdEvent>;
export interface DXDRedemptor extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: DXDRedemptorInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        addSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        domainSeparator(overrides?: CallOverrides): Promise<[string]>;
        isSigner(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        redeem(_oracleMessage: OracleMessageStruct, _signatures: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        removeSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setSignersThreshold(_signersThreshold: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        signersAmount(overrides?: CallOverrides): Promise<[BigNumber]>;
        signersThreshold(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    addSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    domainSeparator(overrides?: CallOverrides): Promise<string>;
    isSigner(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    redeem(_oracleMessage: OracleMessageStruct, _signatures: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    removeSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setSignersThreshold(_signersThreshold: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    signersAmount(overrides?: CallOverrides): Promise<BigNumber>;
    signersThreshold(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        addSigners(_signers: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        domainSeparator(overrides?: CallOverrides): Promise<string>;
        isSigner(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        redeem(_oracleMessage: OracleMessageStruct, _signatures: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
        removeSigners(_signers: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        setSignersThreshold(_signersThreshold: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        signersAmount(overrides?: CallOverrides): Promise<BigNumber>;
        signersThreshold(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "AddSigners(address[])"(addedSigners?: null): AddSignersEventFilter;
        AddSigners(addedSigners?: null): AddSignersEventFilter;
        "Redeem(uint256,uint256,address,uint256,uint256,uint256,bytes[])"(redeemedDXD?: null, circulatingDXDSupply?: null, redeemedToken?: null, redeemedTokenUSDPrice?: null, redeemedAmount?: null, collateralUSDValue?: null, signatures?: null): RedeemEventFilter;
        Redeem(redeemedDXD?: null, circulatingDXDSupply?: null, redeemedToken?: null, redeemedTokenUSDPrice?: null, redeemedAmount?: null, collateralUSDValue?: null, signatures?: null): RedeemEventFilter;
        "RemoveSigners(address[])"(removedSigners?: null): RemoveSignersEventFilter;
        RemoveSigners(removedSigners?: null): RemoveSignersEventFilter;
        "SetSignersThreshold(uint256)"(signersThreshold?: null): SetSignersThresholdEventFilter;
        SetSignersThreshold(signersThreshold?: null): SetSignersThresholdEventFilter;
    };
    estimateGas: {
        addSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        domainSeparator(overrides?: CallOverrides): Promise<BigNumber>;
        isSigner(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        redeem(_oracleMessage: OracleMessageStruct, _signatures: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        removeSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setSignersThreshold(_signersThreshold: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        signersAmount(overrides?: CallOverrides): Promise<BigNumber>;
        signersThreshold(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        domainSeparator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isSigner(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        redeem(_oracleMessage: OracleMessageStruct, _signatures: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        removeSigners(_signers: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setSignersThreshold(_signersThreshold: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        signersAmount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        signersThreshold(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}

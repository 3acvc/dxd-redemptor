import gql from 'graphql-tag';
export var Bundle_OrderBy;
(function (Bundle_OrderBy) {
    Bundle_OrderBy["EthPriceUsd"] = "ethPriceUSD";
    Bundle_OrderBy["Id"] = "id";
})(Bundle_OrderBy || (Bundle_OrderBy = {}));
export var Burn_OrderBy;
(function (Burn_OrderBy) {
    Burn_OrderBy["Amount"] = "amount";
    Burn_OrderBy["Amount0"] = "amount0";
    Burn_OrderBy["Amount1"] = "amount1";
    Burn_OrderBy["AmountUsd"] = "amountUSD";
    Burn_OrderBy["Id"] = "id";
    Burn_OrderBy["LogIndex"] = "logIndex";
    Burn_OrderBy["Origin"] = "origin";
    Burn_OrderBy["Owner"] = "owner";
    Burn_OrderBy["Pool"] = "pool";
    Burn_OrderBy["TickLower"] = "tickLower";
    Burn_OrderBy["TickUpper"] = "tickUpper";
    Burn_OrderBy["Timestamp"] = "timestamp";
    Burn_OrderBy["Token0"] = "token0";
    Burn_OrderBy["Token1"] = "token1";
    Burn_OrderBy["Transaction"] = "transaction";
})(Burn_OrderBy || (Burn_OrderBy = {}));
export var Collect_OrderBy;
(function (Collect_OrderBy) {
    Collect_OrderBy["Amount0"] = "amount0";
    Collect_OrderBy["Amount1"] = "amount1";
    Collect_OrderBy["AmountUsd"] = "amountUSD";
    Collect_OrderBy["Id"] = "id";
    Collect_OrderBy["LogIndex"] = "logIndex";
    Collect_OrderBy["Owner"] = "owner";
    Collect_OrderBy["Pool"] = "pool";
    Collect_OrderBy["TickLower"] = "tickLower";
    Collect_OrderBy["TickUpper"] = "tickUpper";
    Collect_OrderBy["Timestamp"] = "timestamp";
    Collect_OrderBy["Transaction"] = "transaction";
})(Collect_OrderBy || (Collect_OrderBy = {}));
export var Factory_OrderBy;
(function (Factory_OrderBy) {
    Factory_OrderBy["Id"] = "id";
    Factory_OrderBy["Owner"] = "owner";
    Factory_OrderBy["PoolCount"] = "poolCount";
    Factory_OrderBy["TotalFeesEth"] = "totalFeesETH";
    Factory_OrderBy["TotalFeesUsd"] = "totalFeesUSD";
    Factory_OrderBy["TotalValueLockedEth"] = "totalValueLockedETH";
    Factory_OrderBy["TotalValueLockedEthUntracked"] = "totalValueLockedETHUntracked";
    Factory_OrderBy["TotalValueLockedUsd"] = "totalValueLockedUSD";
    Factory_OrderBy["TotalValueLockedUsdUntracked"] = "totalValueLockedUSDUntracked";
    Factory_OrderBy["TotalVolumeEth"] = "totalVolumeETH";
    Factory_OrderBy["TotalVolumeUsd"] = "totalVolumeUSD";
    Factory_OrderBy["TxCount"] = "txCount";
    Factory_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
})(Factory_OrderBy || (Factory_OrderBy = {}));
export var Flash_OrderBy;
(function (Flash_OrderBy) {
    Flash_OrderBy["Amount0"] = "amount0";
    Flash_OrderBy["Amount0Paid"] = "amount0Paid";
    Flash_OrderBy["Amount1"] = "amount1";
    Flash_OrderBy["Amount1Paid"] = "amount1Paid";
    Flash_OrderBy["AmountUsd"] = "amountUSD";
    Flash_OrderBy["Id"] = "id";
    Flash_OrderBy["LogIndex"] = "logIndex";
    Flash_OrderBy["Pool"] = "pool";
    Flash_OrderBy["Recipient"] = "recipient";
    Flash_OrderBy["Sender"] = "sender";
    Flash_OrderBy["Timestamp"] = "timestamp";
    Flash_OrderBy["Transaction"] = "transaction";
})(Flash_OrderBy || (Flash_OrderBy = {}));
export var Mint_OrderBy;
(function (Mint_OrderBy) {
    Mint_OrderBy["Amount"] = "amount";
    Mint_OrderBy["Amount0"] = "amount0";
    Mint_OrderBy["Amount1"] = "amount1";
    Mint_OrderBy["AmountUsd"] = "amountUSD";
    Mint_OrderBy["Id"] = "id";
    Mint_OrderBy["LogIndex"] = "logIndex";
    Mint_OrderBy["Origin"] = "origin";
    Mint_OrderBy["Owner"] = "owner";
    Mint_OrderBy["Pool"] = "pool";
    Mint_OrderBy["Sender"] = "sender";
    Mint_OrderBy["TickLower"] = "tickLower";
    Mint_OrderBy["TickUpper"] = "tickUpper";
    Mint_OrderBy["Timestamp"] = "timestamp";
    Mint_OrderBy["Token0"] = "token0";
    Mint_OrderBy["Token1"] = "token1";
    Mint_OrderBy["Transaction"] = "transaction";
})(Mint_OrderBy || (Mint_OrderBy = {}));
export var OrderDirection;
(function (OrderDirection) {
    OrderDirection["Asc"] = "asc";
    OrderDirection["Desc"] = "desc";
})(OrderDirection || (OrderDirection = {}));
export var PoolDayData_OrderBy;
(function (PoolDayData_OrderBy) {
    PoolDayData_OrderBy["Close"] = "close";
    PoolDayData_OrderBy["Date"] = "date";
    PoolDayData_OrderBy["FeeGrowthGlobal0X128"] = "feeGrowthGlobal0X128";
    PoolDayData_OrderBy["FeeGrowthGlobal1X128"] = "feeGrowthGlobal1X128";
    PoolDayData_OrderBy["FeesUsd"] = "feesUSD";
    PoolDayData_OrderBy["High"] = "high";
    PoolDayData_OrderBy["Id"] = "id";
    PoolDayData_OrderBy["Liquidity"] = "liquidity";
    PoolDayData_OrderBy["Low"] = "low";
    PoolDayData_OrderBy["Open"] = "open";
    PoolDayData_OrderBy["Pool"] = "pool";
    PoolDayData_OrderBy["SqrtPrice"] = "sqrtPrice";
    PoolDayData_OrderBy["Tick"] = "tick";
    PoolDayData_OrderBy["Token0Price"] = "token0Price";
    PoolDayData_OrderBy["Token1Price"] = "token1Price";
    PoolDayData_OrderBy["TvlUsd"] = "tvlUSD";
    PoolDayData_OrderBy["TxCount"] = "txCount";
    PoolDayData_OrderBy["VolumeToken0"] = "volumeToken0";
    PoolDayData_OrderBy["VolumeToken1"] = "volumeToken1";
    PoolDayData_OrderBy["VolumeUsd"] = "volumeUSD";
})(PoolDayData_OrderBy || (PoolDayData_OrderBy = {}));
export var PoolHourData_OrderBy;
(function (PoolHourData_OrderBy) {
    PoolHourData_OrderBy["Close"] = "close";
    PoolHourData_OrderBy["FeeGrowthGlobal0X128"] = "feeGrowthGlobal0X128";
    PoolHourData_OrderBy["FeeGrowthGlobal1X128"] = "feeGrowthGlobal1X128";
    PoolHourData_OrderBy["FeesUsd"] = "feesUSD";
    PoolHourData_OrderBy["High"] = "high";
    PoolHourData_OrderBy["Id"] = "id";
    PoolHourData_OrderBy["Liquidity"] = "liquidity";
    PoolHourData_OrderBy["Low"] = "low";
    PoolHourData_OrderBy["Open"] = "open";
    PoolHourData_OrderBy["PeriodStartUnix"] = "periodStartUnix";
    PoolHourData_OrderBy["Pool"] = "pool";
    PoolHourData_OrderBy["SqrtPrice"] = "sqrtPrice";
    PoolHourData_OrderBy["Tick"] = "tick";
    PoolHourData_OrderBy["Token0Price"] = "token0Price";
    PoolHourData_OrderBy["Token1Price"] = "token1Price";
    PoolHourData_OrderBy["TvlUsd"] = "tvlUSD";
    PoolHourData_OrderBy["TxCount"] = "txCount";
    PoolHourData_OrderBy["VolumeToken0"] = "volumeToken0";
    PoolHourData_OrderBy["VolumeToken1"] = "volumeToken1";
    PoolHourData_OrderBy["VolumeUsd"] = "volumeUSD";
})(PoolHourData_OrderBy || (PoolHourData_OrderBy = {}));
export var Pool_OrderBy;
(function (Pool_OrderBy) {
    Pool_OrderBy["Burns"] = "burns";
    Pool_OrderBy["CollectedFeesToken0"] = "collectedFeesToken0";
    Pool_OrderBy["CollectedFeesToken1"] = "collectedFeesToken1";
    Pool_OrderBy["CollectedFeesUsd"] = "collectedFeesUSD";
    Pool_OrderBy["Collects"] = "collects";
    Pool_OrderBy["CreatedAtBlockNumber"] = "createdAtBlockNumber";
    Pool_OrderBy["CreatedAtTimestamp"] = "createdAtTimestamp";
    Pool_OrderBy["FeeGrowthGlobal0X128"] = "feeGrowthGlobal0X128";
    Pool_OrderBy["FeeGrowthGlobal1X128"] = "feeGrowthGlobal1X128";
    Pool_OrderBy["FeeTier"] = "feeTier";
    Pool_OrderBy["FeesUsd"] = "feesUSD";
    Pool_OrderBy["Id"] = "id";
    Pool_OrderBy["Liquidity"] = "liquidity";
    Pool_OrderBy["LiquidityProviderCount"] = "liquidityProviderCount";
    Pool_OrderBy["Mints"] = "mints";
    Pool_OrderBy["ObservationIndex"] = "observationIndex";
    Pool_OrderBy["PoolDayData"] = "poolDayData";
    Pool_OrderBy["PoolHourData"] = "poolHourData";
    Pool_OrderBy["SqrtPrice"] = "sqrtPrice";
    Pool_OrderBy["Swaps"] = "swaps";
    Pool_OrderBy["Tick"] = "tick";
    Pool_OrderBy["Ticks"] = "ticks";
    Pool_OrderBy["Token0"] = "token0";
    Pool_OrderBy["Token0Price"] = "token0Price";
    Pool_OrderBy["Token1"] = "token1";
    Pool_OrderBy["Token1Price"] = "token1Price";
    Pool_OrderBy["TotalValueLockedEth"] = "totalValueLockedETH";
    Pool_OrderBy["TotalValueLockedToken0"] = "totalValueLockedToken0";
    Pool_OrderBy["TotalValueLockedToken1"] = "totalValueLockedToken1";
    Pool_OrderBy["TotalValueLockedUsd"] = "totalValueLockedUSD";
    Pool_OrderBy["TotalValueLockedUsdUntracked"] = "totalValueLockedUSDUntracked";
    Pool_OrderBy["TxCount"] = "txCount";
    Pool_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    Pool_OrderBy["VolumeToken0"] = "volumeToken0";
    Pool_OrderBy["VolumeToken1"] = "volumeToken1";
    Pool_OrderBy["VolumeUsd"] = "volumeUSD";
})(Pool_OrderBy || (Pool_OrderBy = {}));
export var PositionSnapshot_OrderBy;
(function (PositionSnapshot_OrderBy) {
    PositionSnapshot_OrderBy["BlockNumber"] = "blockNumber";
    PositionSnapshot_OrderBy["CollectedFeesToken0"] = "collectedFeesToken0";
    PositionSnapshot_OrderBy["CollectedFeesToken1"] = "collectedFeesToken1";
    PositionSnapshot_OrderBy["DepositedToken0"] = "depositedToken0";
    PositionSnapshot_OrderBy["DepositedToken1"] = "depositedToken1";
    PositionSnapshot_OrderBy["FeeGrowthInside0LastX128"] = "feeGrowthInside0LastX128";
    PositionSnapshot_OrderBy["FeeGrowthInside1LastX128"] = "feeGrowthInside1LastX128";
    PositionSnapshot_OrderBy["Id"] = "id";
    PositionSnapshot_OrderBy["Liquidity"] = "liquidity";
    PositionSnapshot_OrderBy["Owner"] = "owner";
    PositionSnapshot_OrderBy["Pool"] = "pool";
    PositionSnapshot_OrderBy["Position"] = "position";
    PositionSnapshot_OrderBy["Timestamp"] = "timestamp";
    PositionSnapshot_OrderBy["Transaction"] = "transaction";
    PositionSnapshot_OrderBy["WithdrawnToken0"] = "withdrawnToken0";
    PositionSnapshot_OrderBy["WithdrawnToken1"] = "withdrawnToken1";
})(PositionSnapshot_OrderBy || (PositionSnapshot_OrderBy = {}));
export var Position_OrderBy;
(function (Position_OrderBy) {
    Position_OrderBy["CollectedFeesToken0"] = "collectedFeesToken0";
    Position_OrderBy["CollectedFeesToken1"] = "collectedFeesToken1";
    Position_OrderBy["DepositedToken0"] = "depositedToken0";
    Position_OrderBy["DepositedToken1"] = "depositedToken1";
    Position_OrderBy["FeeGrowthInside0LastX128"] = "feeGrowthInside0LastX128";
    Position_OrderBy["FeeGrowthInside1LastX128"] = "feeGrowthInside1LastX128";
    Position_OrderBy["Id"] = "id";
    Position_OrderBy["Liquidity"] = "liquidity";
    Position_OrderBy["Owner"] = "owner";
    Position_OrderBy["Pool"] = "pool";
    Position_OrderBy["TickLower"] = "tickLower";
    Position_OrderBy["TickUpper"] = "tickUpper";
    Position_OrderBy["Token0"] = "token0";
    Position_OrderBy["Token1"] = "token1";
    Position_OrderBy["Transaction"] = "transaction";
    Position_OrderBy["WithdrawnToken0"] = "withdrawnToken0";
    Position_OrderBy["WithdrawnToken1"] = "withdrawnToken1";
})(Position_OrderBy || (Position_OrderBy = {}));
export var Swap_OrderBy;
(function (Swap_OrderBy) {
    Swap_OrderBy["Amount0"] = "amount0";
    Swap_OrderBy["Amount1"] = "amount1";
    Swap_OrderBy["AmountUsd"] = "amountUSD";
    Swap_OrderBy["Id"] = "id";
    Swap_OrderBy["LogIndex"] = "logIndex";
    Swap_OrderBy["Origin"] = "origin";
    Swap_OrderBy["Pool"] = "pool";
    Swap_OrderBy["Recipient"] = "recipient";
    Swap_OrderBy["Sender"] = "sender";
    Swap_OrderBy["SqrtPriceX96"] = "sqrtPriceX96";
    Swap_OrderBy["Tick"] = "tick";
    Swap_OrderBy["Timestamp"] = "timestamp";
    Swap_OrderBy["Token0"] = "token0";
    Swap_OrderBy["Token1"] = "token1";
    Swap_OrderBy["Transaction"] = "transaction";
})(Swap_OrderBy || (Swap_OrderBy = {}));
export var TickDayData_OrderBy;
(function (TickDayData_OrderBy) {
    TickDayData_OrderBy["Date"] = "date";
    TickDayData_OrderBy["FeeGrowthOutside0X128"] = "feeGrowthOutside0X128";
    TickDayData_OrderBy["FeeGrowthOutside1X128"] = "feeGrowthOutside1X128";
    TickDayData_OrderBy["FeesUsd"] = "feesUSD";
    TickDayData_OrderBy["Id"] = "id";
    TickDayData_OrderBy["LiquidityGross"] = "liquidityGross";
    TickDayData_OrderBy["LiquidityNet"] = "liquidityNet";
    TickDayData_OrderBy["Pool"] = "pool";
    TickDayData_OrderBy["Tick"] = "tick";
    TickDayData_OrderBy["VolumeToken0"] = "volumeToken0";
    TickDayData_OrderBy["VolumeToken1"] = "volumeToken1";
    TickDayData_OrderBy["VolumeUsd"] = "volumeUSD";
})(TickDayData_OrderBy || (TickDayData_OrderBy = {}));
export var TickHourData_OrderBy;
(function (TickHourData_OrderBy) {
    TickHourData_OrderBy["FeesUsd"] = "feesUSD";
    TickHourData_OrderBy["Id"] = "id";
    TickHourData_OrderBy["LiquidityGross"] = "liquidityGross";
    TickHourData_OrderBy["LiquidityNet"] = "liquidityNet";
    TickHourData_OrderBy["PeriodStartUnix"] = "periodStartUnix";
    TickHourData_OrderBy["Pool"] = "pool";
    TickHourData_OrderBy["Tick"] = "tick";
    TickHourData_OrderBy["VolumeToken0"] = "volumeToken0";
    TickHourData_OrderBy["VolumeToken1"] = "volumeToken1";
    TickHourData_OrderBy["VolumeUsd"] = "volumeUSD";
})(TickHourData_OrderBy || (TickHourData_OrderBy = {}));
export var Tick_OrderBy;
(function (Tick_OrderBy) {
    Tick_OrderBy["CollectedFeesToken0"] = "collectedFeesToken0";
    Tick_OrderBy["CollectedFeesToken1"] = "collectedFeesToken1";
    Tick_OrderBy["CollectedFeesUsd"] = "collectedFeesUSD";
    Tick_OrderBy["CreatedAtBlockNumber"] = "createdAtBlockNumber";
    Tick_OrderBy["CreatedAtTimestamp"] = "createdAtTimestamp";
    Tick_OrderBy["FeeGrowthOutside0X128"] = "feeGrowthOutside0X128";
    Tick_OrderBy["FeeGrowthOutside1X128"] = "feeGrowthOutside1X128";
    Tick_OrderBy["FeesUsd"] = "feesUSD";
    Tick_OrderBy["Id"] = "id";
    Tick_OrderBy["LiquidityGross"] = "liquidityGross";
    Tick_OrderBy["LiquidityNet"] = "liquidityNet";
    Tick_OrderBy["LiquidityProviderCount"] = "liquidityProviderCount";
    Tick_OrderBy["Pool"] = "pool";
    Tick_OrderBy["PoolAddress"] = "poolAddress";
    Tick_OrderBy["Price0"] = "price0";
    Tick_OrderBy["Price1"] = "price1";
    Tick_OrderBy["TickIdx"] = "tickIdx";
    Tick_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    Tick_OrderBy["VolumeToken0"] = "volumeToken0";
    Tick_OrderBy["VolumeToken1"] = "volumeToken1";
    Tick_OrderBy["VolumeUsd"] = "volumeUSD";
})(Tick_OrderBy || (Tick_OrderBy = {}));
export var TokenDayData_OrderBy;
(function (TokenDayData_OrderBy) {
    TokenDayData_OrderBy["Close"] = "close";
    TokenDayData_OrderBy["Date"] = "date";
    TokenDayData_OrderBy["FeesUsd"] = "feesUSD";
    TokenDayData_OrderBy["High"] = "high";
    TokenDayData_OrderBy["Id"] = "id";
    TokenDayData_OrderBy["Low"] = "low";
    TokenDayData_OrderBy["Open"] = "open";
    TokenDayData_OrderBy["PriceUsd"] = "priceUSD";
    TokenDayData_OrderBy["Token"] = "token";
    TokenDayData_OrderBy["TotalValueLocked"] = "totalValueLocked";
    TokenDayData_OrderBy["TotalValueLockedUsd"] = "totalValueLockedUSD";
    TokenDayData_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    TokenDayData_OrderBy["Volume"] = "volume";
    TokenDayData_OrderBy["VolumeUsd"] = "volumeUSD";
})(TokenDayData_OrderBy || (TokenDayData_OrderBy = {}));
export var TokenHourData_OrderBy;
(function (TokenHourData_OrderBy) {
    TokenHourData_OrderBy["Close"] = "close";
    TokenHourData_OrderBy["FeesUsd"] = "feesUSD";
    TokenHourData_OrderBy["High"] = "high";
    TokenHourData_OrderBy["Id"] = "id";
    TokenHourData_OrderBy["Low"] = "low";
    TokenHourData_OrderBy["Open"] = "open";
    TokenHourData_OrderBy["PeriodStartUnix"] = "periodStartUnix";
    TokenHourData_OrderBy["PriceUsd"] = "priceUSD";
    TokenHourData_OrderBy["Token"] = "token";
    TokenHourData_OrderBy["TotalValueLocked"] = "totalValueLocked";
    TokenHourData_OrderBy["TotalValueLockedUsd"] = "totalValueLockedUSD";
    TokenHourData_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    TokenHourData_OrderBy["Volume"] = "volume";
    TokenHourData_OrderBy["VolumeUsd"] = "volumeUSD";
})(TokenHourData_OrderBy || (TokenHourData_OrderBy = {}));
export var Token_OrderBy;
(function (Token_OrderBy) {
    Token_OrderBy["Decimals"] = "decimals";
    Token_OrderBy["DerivedEth"] = "derivedETH";
    Token_OrderBy["FeesUsd"] = "feesUSD";
    Token_OrderBy["Id"] = "id";
    Token_OrderBy["Name"] = "name";
    Token_OrderBy["PoolCount"] = "poolCount";
    Token_OrderBy["Symbol"] = "symbol";
    Token_OrderBy["TokenDayData"] = "tokenDayData";
    Token_OrderBy["TotalSupply"] = "totalSupply";
    Token_OrderBy["TotalValueLocked"] = "totalValueLocked";
    Token_OrderBy["TotalValueLockedUsd"] = "totalValueLockedUSD";
    Token_OrderBy["TotalValueLockedUsdUntracked"] = "totalValueLockedUSDUntracked";
    Token_OrderBy["TxCount"] = "txCount";
    Token_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    Token_OrderBy["Volume"] = "volume";
    Token_OrderBy["VolumeUsd"] = "volumeUSD";
    Token_OrderBy["WhitelistPools"] = "whitelistPools";
})(Token_OrderBy || (Token_OrderBy = {}));
export var Transaction_OrderBy;
(function (Transaction_OrderBy) {
    Transaction_OrderBy["BlockNumber"] = "blockNumber";
    Transaction_OrderBy["Burns"] = "burns";
    Transaction_OrderBy["Collects"] = "collects";
    Transaction_OrderBy["Flashed"] = "flashed";
    Transaction_OrderBy["GasPrice"] = "gasPrice";
    Transaction_OrderBy["GasUsed"] = "gasUsed";
    Transaction_OrderBy["Id"] = "id";
    Transaction_OrderBy["Mints"] = "mints";
    Transaction_OrderBy["Swaps"] = "swaps";
    Transaction_OrderBy["Timestamp"] = "timestamp";
})(Transaction_OrderBy || (Transaction_OrderBy = {}));
export var UniswapDayData_OrderBy;
(function (UniswapDayData_OrderBy) {
    UniswapDayData_OrderBy["Date"] = "date";
    UniswapDayData_OrderBy["FeesUsd"] = "feesUSD";
    UniswapDayData_OrderBy["Id"] = "id";
    UniswapDayData_OrderBy["TvlUsd"] = "tvlUSD";
    UniswapDayData_OrderBy["TxCount"] = "txCount";
    UniswapDayData_OrderBy["VolumeEth"] = "volumeETH";
    UniswapDayData_OrderBy["VolumeUsd"] = "volumeUSD";
    UniswapDayData_OrderBy["VolumeUsdUntracked"] = "volumeUSDUntracked";
})(UniswapDayData_OrderBy || (UniswapDayData_OrderBy = {}));
export var _SubgraphErrorPolicy_;
(function (_SubgraphErrorPolicy_) {
    _SubgraphErrorPolicy_["Allow"] = "allow";
    _SubgraphErrorPolicy_["Deny"] = "deny";
})(_SubgraphErrorPolicy_ || (_SubgraphErrorPolicy_ = {}));
export const GetUniswapV3PoolDataByTokensAtBlockDocument = gql `
    query getUniswapV3PoolDataByTokensAtBlock($token0: String!, $token1: String!, $blockNumber: Int!) {
  pools(
    where: {token0: $token0, token1: $token1}
    block: {number: $blockNumber}
    orderBy: feeTier
    orderDirection: asc
  ) {
    id
    token0Price
    token1Price
    token0 {
      address: id
      decimals
      symbol
    }
    token1 {
      address: id
      decimals
      symbol
    }
    feeTier
  }
}
    `;
const defaultWrapper = (action, _operationName, _operationType) => action();
export function getSdk(client, withWrapper = defaultWrapper) {
    return {
        getUniswapV3PoolDataByTokensAtBlock(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(GetUniswapV3PoolDataByTokensAtBlockDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'getUniswapV3PoolDataByTokensAtBlock', 'query');
        }
    };
}

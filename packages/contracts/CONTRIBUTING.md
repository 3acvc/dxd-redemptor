## Contracts

The contracts are developed using Solidity and Foundry, so in order to contribute you need to first
install Foundry locally. Check out [this link](https://getfoundry.sh/) to easily install Foundry on
your machine. Make sure you periodically update Foundry to the latest version using `foundryup`.

Foundry manages dependencies using git submodules, so it's advised to use
`git clone --recurse-submodules` when cloning the repo in order to have a ready-to-go environment.
If `git clone` was used without the `--recurse-submodules` flag, you can just run
`git submodule update --init --recursive` in the cloned repo in order to easily install the
dependencies.

After having done the above, the environment should be ready to work with.

### Testing

Tests are written in Solidity and you can find them in the `tests` folder. Both property-based
fuzzing and standard unit tests are easily supported through the use of Foundry.

In order to launch tests you can both use Forge commands directly or npm scripts (installed Foundry
is still a requirement). For example, these are the available npm scripts:

- `test`: self explanatory, simply runs the tests.
- `test:gasreport`: runs the tests giving out a gas consumption report at the end.
- `test:coverage`: runs the tests giving out a coverage report at the end.

### Deploying

In order to deploy the whole platform to a given network you can go ahead and create a
.env.<NETWORK_NAME> file exporting 3 env variables:

```
export PRIVATE_KEY=""
export RPC_ENDPOINT=""
export INITIAL_SIGNERS==""
```

brief explainer of the env variables:

- `PRIVATE_KEY`: the private key of the account that will perform the deployment.
- `RPC_ENDPOINT`: the RPC endpoint that will be used to broadcast transactions. This will also
  determine the network where the deployment will happen.
- `INITIAL_SIGNERS`: an address array. These will be the initially whitelisted signers.

Once you have one instance of this file for each network you're interested in (e.g. .`env.goerli`,
`.env.gnosis`, `env.mainnet` etc etc), you can go ahead and locally load the env variables by
executing `source .env.<NETWORK_NAME>`. After doing that, you can finally execute the following
command to initiate the deployment:

```
forge script --broadcast --slow --private-key $PRIVATE_KEY --fork-url $RPC_ENDPOINT --sig 'run(address[])' ./scripts/Deploy.s.sol $INITIAL_SIGNERS
```

Two alternative forms of the command can be used in order for the deployment to be completed with
either Trezor or Ledger hardware wallets (all the arguments remain the same as above):

```
forge script --broadcast --slow --ledger --fork-url $RPC_ENDPOINT --sig 'run(address[])' ./scripts/Deploy.s.sol $INITIAL_SIGNERS
forge script --broadcast --slow --trezor --fork-url $RPC_ENDPOINT --sig 'run(address[])' ./scripts/Deploy.s.sol $INITIAL_SIGNERS
```

### Getting an oracle message hash

In order to get an oracle message hash you can go ahead and create a `.env` file exporting the
following env variables:

```
export REDEEMED_DXD=10000000000000
export CIRCULATING_DXD_SUPPLY=10000000000000000
export REDEEMED_TOKEN=0x0000000000000000000000000000000000000000
export REDEEMED_TOKEN_USD_PRICE=10000000000000000000000
export REDEEMED_AMOUNT=10000000000000000000000
export COLLATERAL_USD_VALUE=10000000000000000
export DEADLINE=20000000
```

brief explainer of the env variables:

- `REDEEMED_DXD`: the amount of DXD the user wants to redeem.
- `CIRCULATING_DXD_SUPPLY`: the current circulating amount of DXD.
- `REDEEMED_TOKEN`: the token the redeemer wants to redeem DXD for.
- `REDEEMED_TOKEN_USD_PRICE`: the current USD price of `REDEEMED_TOKEN`.
- `REDEEMED_AMOUNT`: the amount of `REDEEMED_TOKEN` that the user can redeem according to current
  market conditions.
- `COLLATERAL_USD_VALUE`: the value of the "collateral" backing the circulating DXD (for example 70%
  of NAV).
- `DEADLINE`: the deadline block for the oracle message to be valid.

Once you have the file ready you can go ahead and locally load the env variables by executing
`source .env`. After doing that, you can finally execute the following command to get the hash
according to the parameters you specified:

```
forge script --sig 'run((uint256,uint256,address,uint256,uint256,uint256,uint256))' ./scripts/GetOracleMessageHash.s.sol "($REDEEMED_DXD,$CIRCULATING_DXD_SUPPLY,$REDEEMED_TOKEN,$REDEEMED_TOKEN_USD_PRICE,$REDEEMED_AMOUNT,$COLLATERAL_USD_VALUE,$DEADLINE)"
```

### Addresses

"Official" deployments and addresses will be tracked in the `.addresses.json` file in the package
directory (`packages/contracts/addresses/json`), even though it might be unreliable for testnets.

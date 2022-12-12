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

### Addresses

"Official" deployments and addresses will be tracked in the `.addresses.json` file in the package
directory (`packages/contracts/addresses/json`), even though it might be unreliable for testnets.

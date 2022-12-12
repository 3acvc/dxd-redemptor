# Contributing

## General

We use Turbo to manage the monorepo in an optimal way. The packages included are:

- `aggregator`: quoter and verifier signatures aggregator written in Typescript.
- `contracts`: smart contracts developed with Solidity and Foundry.
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-prettier`)
- `oracle`: unified and shared library to fetch redemption quotes at a given block(s).
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `verifier`: the verifier service pinged by the aggregator (trust minimization mechanism).

### Getting started

In order to get started simply clone the repo and make sure you have `pnpm` (the package manager of
choice for the project), `foundry` (the build system used to manage contracts development) and
optionally `Docker` (if you want to make testing hassle free).

Once these are installed, run `pnpm i` from the root and make sure you initialize `husky` by running
`pnpm husky`.

You're now ready to code, check out the `CONTRIBUTING.md` files in the specific packages to have
more detailed info on each package's development.

More generic information follows.

### Github Actions

The repository uses GH actions to setup CI to automatically build, test and lint all the packages on
each push to main or opened pull request.

### Pre-commit hooks

In order to reduce the possibility to make mistakes to the minimum, pre-commit hooks are enabled to
both run all the available tests (through the same command used in the GH actions) and to lint the
commit message through `husky` and `@commitlint/config-conventional`. Please have a look at the
supported formats by checking
[this](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
out.

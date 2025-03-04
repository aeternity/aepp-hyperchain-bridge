# Hyperchain Bridge

This project is created to establish bridges between Aeternity networks (Hyperchain, Mainnet). Project will include smart contracts, tests, backend server to bond the funds and a frontend application to interact with the contracts/bridge.

## Getting started

### Install dependencies

Project uses [Bun](https://bun.sh/docs) toolkit, so before proceeding [Bun installation](https://bun.sh/docs/installation) should be completed.

Afterwards, run the following command to install the project dependencies:

```
bun install
```

### Compile smart contracts

Project has a [aesophia_cli v8 binary](https://github.com/aeternity/aesophia_cli/blob/master/priv/bin/v8.0.0/aesophia_cli) in the `/bin` folder to compile the contracts with following command:

```
bun run compile
```

### Running the tests

Project uses Bun test runner and it can run the test without any additional package with the following command:

```
bun run tests
```

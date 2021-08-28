# 🏗 Solana App Scaffold
Scaffolding for a dapp built on Solana

# TODO
- adjust layout with window size
- code cleaning & restructure
- add Token Name & icon
- add Token market value

# Directory structure

## program

Solana program template in Rust

### program/src/lib.rs
* process_instruction function is used to run all calls issued to the smart contract

## src/actions

Setup here actions that will interact with Solana programs using sendTransaction function

## src/contexts

React context objects that are used propagate state of accounts across the application

## src/hooks

Generic react hooks to interact with token program:
* useUserBalance - query for balance of any user token by mint, returns:
    - balance
    - balanceLamports
    - balanceInUSD
* useUserTotalBalance - aggregates user balance across all token accounts and returns value in USD
    - balanceInUSD
* useAccountByMint
* useTokenName
* useUserAccounts

## src/views

* home - main page for your app
* faucet - airdrops SOL on Testnet and Devnet
# tryout

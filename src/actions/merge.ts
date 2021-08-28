import { AccountLayout, MintLayout, Token, u64 as U64 } from "@solana/spl-token";
import {
    Account,
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT } from "../utils/ids";
import { GroupedTokenAccounts, TokenAccount } from "../models";
import { ASSOCIATED_TOKEN_PROGRAM_ID, cache, TokenAccountParser } from "./../contexts/accounts";
import { createUninitializedAccount } from "./account";

export function createDuplicateTokenAccount(
    instructions: TransactionInstruction[],
    payer: PublicKey,
    accountRentExempt: number,
    mint: PublicKey,
    owner: PublicKey,
    signers: Account[]
) {
    const account1 = createUninitializedAccount(
        instructions,
        payer,
        accountRentExempt,
        signers
    );

    const account2 = createUninitializedAccount(
        instructions,
        payer,
        accountRentExempt,
        signers
    );

    instructions.push(
        Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, account1, owner)
    );
    instructions.push(
        Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, account2, owner)
    );

    return [account1, account2];
}

export function mergeTokens(
    instructions: TransactionInstruction[],
    groupedTokenAccounts: GroupedTokenAccounts,
    connection: Connection,
    owner: PublicKey,
    signers: Account[],
    mint?: PublicKey,
) {
    const mergeableList = mint ? [mint.toString()] : Object.keys(groupedTokenAccounts);

    mergeableList.forEach((key) => {
        const ata = groupedTokenAccounts[key].ata;
        const ataInfo = groupedTokenAccounts[key].ataInfo;
        const auxAccts = groupedTokenAccounts[key].auxAccounts;
        const balances = groupedTokenAccounts[key].balances;
        console.log(ataInfo)
        if (!ataInfo) {
            console.log('create ata instruction');
            instructions.push(
                Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, new PublicKey(key), new PublicKey(ata), owner, owner)
            );
        }
        for (let i = 0; i < auxAccts.length; i++) {
            const auxAcc = auxAccts[i];
            const balance = balances[i];

            instructions.push(
                Token.createTransferInstruction(TOKEN_PROGRAM_ID, new PublicKey(auxAcc), new PublicKey(ata), owner, signers, new U64(balance))
            );


            instructions.push(
                Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, new PublicKey(auxAcc), new PublicKey(ata), owner, signers)
            );
        }
    })
    return;

}



import {
    Connection,
    PublicKey,
} from '@solana/web3.js';

import { TokenInstructions } from '@project-serum/serum';
import { TOKEN_PROGRAM_ID } from './ids';


export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);


export async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey,
) {
    return (
        await PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                TokenInstructions.TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        )
    )[0];
}

export async function groupTokens(connection: Connection, groupedTokenAccounts: any, publicKey: PublicKey) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
    tokenAccounts.value.forEach(async (ta: any) => {
        const key = ta.account.data.parsed.info.mint.toString();
        const ata = (await findAssociatedTokenAddress(publicKey, new PublicKey(key))).toString();

        if (ata !== ta.pubkey.toString()) {
            if (groupedTokenAccounts[key]) {
                groupedTokenAccounts[key].auxAccounts.push(ta.pubkey.toString());
            } else {
                groupedTokenAccounts[key] = { auxAccounts: [ta.pubkey.toString()], ata: ata };
            }
        }
    });
}



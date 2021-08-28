import { TokenAccount } from "../models";
import { useAccountsContext } from "../contexts/accounts";
import { getTokenName } from "../utils/utils";
import { useConnection } from "../contexts/connection";
import { useWallet } from "@solana/wallet-adapter-react";
import { groupTokens } from "../utils/token";

export function useMigTokenAccounts() {
  const context = useAccountsContext();
  let groupedTokenAccounts = {};
  /*if (!publicKey) {
    return;
  }
  await groupTokens(connection, groupedTokenAccounts, publicKey);
  return getTokenName(tokenMap, address);

  const { tokenMap } = useConnectionConfig();
  const address =
    typeof mintAddress === "string" ? mintAddress : mintAddress?.toBase58();*/
  
}

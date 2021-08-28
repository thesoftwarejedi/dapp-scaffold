import { Button, Col, Input, Row } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { sendTransaction } from "../../contexts/connection";

import { notify } from "../../utils/notifications";
import { ConnectButton } from "./../../components/ConnectButton";
import { LABELS } from "../../constants";
import { createDuplicateTokenAccount } from "../../actions";
import { useConnection } from "../../contexts/connection";
import { useWallet } from "@solana/wallet-adapter-react";
import { TransactionInstruction, PublicKey, Transaction } from "@solana/web3.js";


export const HomeView = () => {
  const connection = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [ mint, setMint] = useState('C4xYD4886ZDDFNnKHAJ11RSCQSnhuMED2qcz8mJiytNb');

  const handleMintChange = (e: any) =>setMint(e.target.value);

  const handleDuplicateAccountCreation = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }
      let instructions: TransactionInstruction[] = [];
      let transaction: Transaction = new Transaction();
      console.log(instructions);
      const signers: any = []
      const mintTestToken = new PublicKey(mint);

      // Creates 2 aux
      const value = await createDuplicateTokenAccount(instructions, publicKey, 10000000, mintTestToken, publicKey,  signers)

      instructions.forEach(instruct => {
        transaction.add(instruct);
      })

      // Walletadapter type doesn't work correctly
      const hackyWallet = {publicKey: publicKey, signTransaction: signTransaction } as any;

      const result = await sendTransaction(connection, hackyWallet, instructions, signers);
      
      notify({
        // TODO change labels
        message: LABELS.TOKEN_SCRAMBLED,
        type: "success",
      });
    } catch (error) {
      notify({
        // TODO change labels
        message: LABELS.TOKEN_SCRAMBLED_FAILED,
        type: "error",
      });
      console.error(error);
    }
  }, [publicKey, connection]);

  return (
    <Row gutter={[16, 16]} className='home-page' align="top">
      <Col span={12}>
        <ConnectButton type="primary" onClick={handleDuplicateAccountCreation}>
            Scramble mint
        </ConnectButton>
        <Input type="text" value={mint} onChange={handleMintChange} />
      </Col>
      <Col span={12}>
        <Link to="/tools">
          <Button>ToolPage</Button>
        </Link>
      </Col>
    </Row>
  );
};

import React, { useCallback, useEffect, useState } from "react";
import { sendTransaction, useConnection, useConnectionConfig } from "../../contexts/connection";
import { LAMPORTS_PER_SOL, Transaction, TransactionInstruction } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { LABELS } from "../../constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Row, Col, Collapse, Space, Card } from 'antd';
import { groupMigTokens } from "../../contexts/accounts";
import { GroupedTokenAccounts } from "../../models";
import { mergeTokens } from "../../actions";
import { CheckCircleFilled, CheckCircleTwoTone, InfoCircleFilled, SmileOutlined, ToolFilled } from "@ant-design/icons";
import spoof from "../../left_side.png";

export const AccountToolsView = () => {
  const connection = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { Panel } = Collapse;
  const [groupedTokenAccounts, setGroupedTokenAccounts] = useState<GroupedTokenAccounts>();
  const [tokenCards, setTokenCards] = useState<any>([]);

  useEffect(() => {
    if (publicKey) {
      handleMigrateRequest();
    }
  }, [publicKey]);


  useEffect(() => {
    if (groupedTokenAccounts) {
      console.log(groupedTokenAccounts);

      var tempTokenCards: any[] = [];
      Object.keys(groupedTokenAccounts).forEach((key) => {
        setTokenCards(tempTokenCards.concat(
          <Card className='token-card' key={key}>
            <Row justify="space-around">
              <Col span={4}>
                <div>
                  <div>
                    <SmileOutlined /> TOKEN
                  </div>
                  <div>
                    <small>Asset</small>
                  </div>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <div>
                    {truncateString(key)}
                  </div>
                  <div>
                    <small>Account</small>
                  </div>
                </div>

              </Col>
              <Col span={4}>
                <div>
                  <div>
                    {groupedTokenAccounts[key].totalBalance}
                  </div>
                  <div>
                    <small>$$$$$</small>
                  </div>
                </div></Col>
              <Col span={4}><button className='step-button' onClick={(e) => { clickMigrate(key) }}>Migrate</button></Col>
            </Row>
          </Card>
        ));
      })
    }
  }, [groupedTokenAccounts, signTransaction]);

  const handleMigrateRequest = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }
      const groupedTokenAccTemp = await groupMigTokens(connection, publicKey);
      if (Object.keys(groupedTokenAccTemp).length !== 0) {
        setGroupedTokenAccounts(groupedTokenAccTemp);
      } else {
        setGroupedTokenAccounts(undefined);
      }
    } catch (error) {
      notify({
        message: LABELS.AIRDROP_FAIL,
        type: "error",
      });
      console.error(error);
    }
  }, [publicKey, connection]);

  function truncateString(text: string) {
    return text.substring(0, 4) + '...' + text.substring(text.length - 4, text.length)
  }

  async function clickMigrate(mint?: string) {
    try {
      if (!groupedTokenAccounts || !publicKey) {
        return;
      }
      let instructions: TransactionInstruction[] = [];
      let transaction: Transaction = new Transaction();
      if (mint) {
        mergeTokens(instructions, groupedTokenAccounts, connection, publicKey, [], new PublicKey(mint));
      } else {
        mergeTokens(instructions, groupedTokenAccounts, connection, publicKey, []);
      }
      

      instructions.forEach(instruct => {
        transaction.add(instruct);
      })

      // Walletadapter type doesn't work correctly
      const hackyWallet = { publicKey: publicKey, signTransaction: signTransaction } as any;

      const result = await sendTransaction(connection, hackyWallet, instructions, []);

      notify({
        message: LABELS.MIGRATED,
        type: "success",
      });
      handleMigrateRequest();
    } catch (error) {
      notify({
        message: LABELS.MIGRATE_FAILED,
        type: "error",
      });
      console.error(error);
    }
  }

  return (
    <Row className='tools-page'>
      <Col span={4}>
        <img src={spoof} alt='left side'></img>
      </Col>
      <Col span={20}>
        <div>
          <div className="tools-title">
            <ToolFilled color='white' /> Account Cleanup Tools
          </div>
          <Space >
            <Collapse ghost>
              {groupedTokenAccounts ? (
                <Panel className="custom-collapsed-tools" showArrow={false} header={<div><InfoCircleFilled /> Migrate Associated Token Accounts</div>} key="1">
                  <div className="tools-subtext">
                    <span>
                      Some dApps on Solana create new addresses for each token you own in form of <a style={{color:'#05bb8c'}} href="https://spl.solana.com/associated-token-account">associated token accounts</a>.
                      You can use this page to migrate these tokens to your main address.
                    </span>
                    <div className="tools-infotext">
                      <Row>
                        <Col span={19}>
                          <span>
                            {Object.keys(groupedTokenAccounts as any).length} accounts requiring migration
                          </span>
                        </Col>
                        <Col span={5}>
                          <div>
                            <button className='step-button' onClick={(e) => { clickMigrate() }}>Migrate All</button>
                          </div>
                        </Col>
                      
                      </Row>
                        
                    </div>
                    {tokenCards}
                  </div>
                </Panel>
              ) : (
                <Panel className="custom-collapsed-tools" collapsible="disabled" showArrow={false} header={<div><CheckCircleFilled color='#06d6a0' /> No Associated Token Accounts to migrate</div>} key="1">

                </Panel>
              )}
              <Panel className="custom-collapsed-tools" collapsible="disabled" showArrow={false} header={<div><CheckCircleFilled color='#06d6a0' /> No Open Order Accounts on Serum to close</div>} key="2">
              </Panel>
              <Panel className="custom-collapsed-tools" collapsible="disabled" showArrow={false} header={<div><CheckCircleFilled color='#06d6a0' /> No Unititialised Accounts to close</div>} key="3">
              </Panel>
            </Collapse>
          </Space>
        </div>
      </Col>
    </Row>
  );
};
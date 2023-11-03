import React, { useState, useEffect } from 'react'
import getFundData from '../../utils/getFundData'
import getUserData from '../../utils/getUserData'
import { EtherscanLink } from '../../config'
import { Select, Box, OrderedList, ListItem, Grid, GridItem, SimpleGrid, useColorModeValue, Icon, Text, } from '@chakra-ui/react'
import { fromWei } from 'web3-utils'
import Footer from '../../Components/common/footer/Footer'
import { useParams } from 'react-router-dom'
import IconBox from '../../Components/Icons/IconBox'
import ShadowBox from '../../Components/Cards/ShadowBox'
import { HiReceiptTax } from 'react-icons/hi'
import Header from '../../Components/common/Header'

const ETH_TOKEN = String("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE").toLowerCase()

function ViewManager() {

    const { address } = useParams();
    const textColor = useColorModeValue("#A4ADC7", "white");
    const headingbg = useColorModeValue("gray.200", "gray");
    const brandColor = useColorModeValue("#422AFB", "##CBC3E3");
    const boxBg = useColorModeValue("#F4F7FE", "gray.600");
    const [funds, setFunds] = useState([]);
    const [deposit, setDeposit] = useState([]);
    const [trade, setTrade] = useState([]);
    const [withdraw, setWithdraw] = useState([]);
    const [showFundsTX, setShowFundsTX] = useState(true);
    const [showDepositTX, setShowDepositTX] = useState(true);
    const [showTradeTX, setShowTradeTX] = useState(true);
    const [showWithdrawTX, setShowWithdrawTX] = useState(true);

    const isMountedRef = React.useRef(null);
    useEffect(() => {
        isMountedRef.current = true;
        getAllFundTxs();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const getAllFundTxs = async () => {
        if (isMountedRef.current) {
            // Get all users in fund
            const data = await getFundData(address);
            const owner = data.data.result.owner;

            // Create users array
            let users = [];
            let _users = data.data.result.shares;
            if (_users) {
                users = JSON.parse(_users).map(index => index.user);
                users.push(owner);
                users = Array.from(new Set(users));
            } else {
                users.push(owner);
            }

            let fund = [];
            let deposit = [];
            let withdraw = [];
            let trade = [];

            // get all txs
            for (let i = 0; i < users.length; i++) {
                const txData = await getUserData(users[i]);

                if (JSON.parse(txData.data.result[0].funds) !== null)
                    fund.push([...JSON.parse(txData.data.result[0].funds)]);

                if (JSON.parse(txData.data.result[0].withdraw) !== null)
                    withdraw.push([...JSON.parse(txData.data.result[0].withdraw)]);

                if (JSON.parse(txData.data.result[0].deposit) !== null)
                    deposit.push([...JSON.parse(txData.data.result[0].deposit)]);

                if (JSON.parse(txData.data.result[0].trade) !== null)
                    trade.push([...JSON.parse(txData.data.result[0].trade)]);
            }

            if (isMountedRef.current) {
                setFunds(fund.flat());
                setDeposit(deposit.flat());
                setTrade(trade.flat());
                setWithdraw(withdraw.flat());
            }
        }
    }

    const toggle = (name) => {
        switch (name) {
            case 'showFundsTX':
                setShowFundsTX(prevState => !prevState);
                break;
            case 'showDepositTX':
                setShowDepositTX(prevState => !prevState);
                break;
            case 'showTradeTX':
                setShowTradeTX(prevState => !prevState);
                break;
            case 'showWithdrawTX':
                setShowWithdrawTX(prevState => !prevState);
                break;
            default:
                break;
        }
    }

    const renderTx = (data, stateName) => {
        return (
            <Box>
                {
                    data && data.length > 0
                        ?
                        (
                            <Box>
                                {data.map((item, key) =>

                                    item.fund === address
                                        ?
                                        (
                                            <OrderedList key={item.transactionHash} sx={{ listStyle: "none", textTransform: "capitalize", color: textColor }}>
                                                <ListItem>blockNumber: <a href={EtherscanLink + "/block/" + item.blockNumber} target="_blank" rel="noopener noreferrer">{item.blockNumber}</a></ListItem>
                                                <ListItem>Tx hash: <a href={EtherscanLink + "/tx/" + item.transactionHash} target="_blank" rel="noopener noreferrer">{item.transactionHash}</a></ListItem>
                                                <ListItem>Fund address: <a href={EtherscanLink + "/address/" + item.fund} target="_blank" rel="noopener noreferrer">{item.fund}</a></ListItem>
                                                {additionalData(item, stateName)}
                                            </OrderedList>
                                        )
                                        : (null)
                                )}
                            </Box>
                        )
                        :
                        (
                            <OrderedList sx={{ listStyle: "none", textTransform: "capitalize", fontWeight: "500", color: textColor }}>
                                <ListItem>no tx</ListItem>
                            </OrderedList>
                        )
                }
            </Box>
        )
    }

    const additionalData = (data, state) => {
        switch (state) {
            case 'funds':
                return (null)

            case 'deposit':
                return (
                    <Box>
                        <OrderedList sx={{ listStyle: "none", textTransform: "capitalize", color: textColor }}>
                            <ListItem>Aditional data</ListItem>
                            <ListItem>Deposit amount: {fromWei(data.additionalData.amount)}</ListItem>
                            <ListItem>Total shares: {fromWei(data.additionalData.totalShares)} </ListItem>
                            <ListItem>Shares received: {fromWei(data.additionalData.sharesReceived)} </ListItem>
                        </OrderedList>
                    </Box>
                )

            case 'trade':
                return (
                    <Box>
                        <OrderedList sx={{ listStyle: "none", textTransform: "capitalize", color: textColor }}>
                            <ListItem>Aditional data</ListItem>
                            <ListItem>src token address:
                                {
                                    String(data.additionalData.src).toLowerCase() === ETH_TOKEN
                                        ?
                                        (
                                            <React.Fragment>BNB</React.Fragment>
                                        )
                                        :
                                        (
                                            <a href={EtherscanLink + "/token/" + data.additionalData.src} target="_blank" rel="noopener noreferrer">
                                                {data.additionalData.src}
                                            </a>
                                        )
                                }
                            </ListItem>
                            <ListItem>amount send: {fromWei(data.additionalData.srcAmount)} </ListItem>
                            <ListItem>dest token address:
                                {
                                    String(data.additionalData.dest).toLowerCase() === ETH_TOKEN
                                        ?
                                        (
                                            <React.Fragment>BNB</React.Fragment>
                                        )
                                        :
                                        (
                                            <a href={EtherscanLink + "/token/" + data.additionalData.dest} target="_blank" rel="noopener noreferrer">
                                                {data.additionalData.dest}
                                            </a>
                                        )
                                }
                            </ListItem>
                            <ListItem>dest recived amount: {fromWei(data.additionalData.destReceived)}</ListItem>
                        </OrderedList>
                    </Box>
                )

            case 'withdraw':
                return (
                    <Box>
                        <OrderedList sx={{ listStyle: "none", textTransform: "capitalize", color: textColor }}>
                            <ListItem>Aditional data</ListItem>
                            <ListItem>Shares removed: {fromWei(data.additionalData.sharesRemoved)} </ListItem>
                            <ListItem>Total shares: {fromWei(data.additionalData.totalShares)} </ListItem>
                        </OrderedList>
                    </Box>
                )

            default:
                return null
        }
    }

    return (
        <React.Fragment>
            <Box p={5} >
              <Header heading="View-Fund-Tx" />
                <Box mt={5}>
                    <Grid py={5} sx={{ display: "flex", alignItems: "center", }}>
                        <GridItem>
                            <Select onChange={(e) => toggle(e.target.value)}>
                                <option value="" hidden>Sorting tx</option>
                                <option value="showFundsTX">{showFundsTX ? "Disable" : "Enable"} funds tx</option>
                                <option value="showDepositTX">{showDepositTX ? "Disable" : "Enable"} deposit tx</option>
                                <option value="showTradeTX">{showTradeTX ? "Disable" : "Enable"} trade tx</option>
                                <option value="showWithdrawTX">{showWithdrawTX ? "Disable" : "Enable"} withdraw tx</option>
                            </Select>
                        </GridItem>
                    </Grid>

                    <Box sx={{ boxShadow: "0px 1px 1px 1px lightgray", borderRadius: "10px", }}>
                        <Text sx={{ fontWeight: "500", textAlign: "center", backgroundColor: headingbg, padding: "10px 5px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>  All transactions for address : <small> <a className='link' style={{ color: "#039be5" }} href={EtherscanLink + "/address/" + address} target="_blank" rel="noopener noreferrer">{address}</a></small></Text>
                        <SimpleGrid p={5} pb={5} columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 10 }}>
                            {
                                showFundsTX ?
                                    (
                                        <ShadowBox
                                            startContent={
                                                <IconBox
                                                    w='56px'
                                                    h='56px'
                                                    bg={boxBg}
                                                    icon={
                                                        <Icon w='32px' h='32px' as={HiReceiptTax} color={brandColor} />
                                                    }
                                                />
                                            }
                                            name='CREATE FUND TX'
                                            value={renderTx(funds, "deposit")}
                                        />
                                    )
                                    : (null)
                            }
                            {
                                showDepositTX ?
                                    (
                                        <ShadowBox
                                            startContent={
                                                <IconBox
                                                    w='56px'
                                                    h='56px'
                                                    bg={boxBg}
                                                    icon={
                                                        <Icon w='32px' h='32px' as={HiReceiptTax} color={brandColor} />
                                                    }
                                                />
                                            }
                                            name='DEPOSITE TX'
                                            value={renderTx(deposit, "deposit")}
                                        />
                                    )
                                    : (null)
                            }

                            {
                                showTradeTX ?
                                    (
                                        <ShadowBox
                                            startContent={
                                                <IconBox
                                                    w='56px'
                                                    h='56px'
                                                    bg={boxBg}
                                                    icon={
                                                        <Icon w='32px' h='32px' as={HiReceiptTax} color={brandColor} />
                                                    }
                                                />
                                            }
                                            name='TRADE TX'
                                            value={renderTx(trade, "trade")}
                                        />
                                    )
                                    : (null)
                            }
                            {
                                showWithdrawTX ?
                                    (
                                        <ShadowBox
                                            startContent={
                                                <IconBox
                                                    w='56px'
                                                    h='56px'
                                                    bg={boxBg}
                                                    icon={
                                                        <Icon w='32px' h='32px' as={HiReceiptTax} color={brandColor} />
                                                    }
                                                />
                                            }
                                            name='WITHDRAW TX'
                                            value={renderTx(withdraw, "withdraw")}
                                        />
                                    )
                                    : (null)
                            }
                        </SimpleGrid>
                    </Box>
                    <Footer />
                </Box>
            </Box>
        </React.Fragment>
    );
}
export default ViewManager

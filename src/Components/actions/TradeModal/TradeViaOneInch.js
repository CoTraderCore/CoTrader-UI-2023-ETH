import React, { Component } from 'react'
import {
    SmartFundABIV7,
    OneInchApi,
    NeworkID,
    ERC20ABI,
    APIEnpoint,
    // ExchangePortalAddressLight,
    ExchangePortalAddressV7,
    ExchangePortalABIV6,
    WETH
} from '../../../config.js'
import { Button, FormControl, InputGroup, Alert, AlertIcon, FormLabel, Box, Input, Text, } from '@chakra-ui/react'
import setPending from '../../../utils/setPending.js'
import getMerkleTreeData from '../../../utils/getMerkleTreeData'
import axios from 'axios'
import { toWeiByDecimalsInput, fromWeiByDecimalsInput } from '../../../utils/weiByDecimals'
import BigNumber from 'bignumber.js'
import { testnetSymbols, testnetTokens } from '../../../Storage/testnetTokens.js'
import SelectToken from './SelectToken'
import CheckTokensLimit from '../../../utils/checkTokensLimit'
import Pending from '../../template/spiners/Pending.js'

class TradeViaOneInch extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            Send: 'ETH',
            Recive: 'BUSD',
            AmountSend: 0,
            AmountRecive: 0,
            slippageFrom: 0,
            slippageTo: 0,
            ERRORText: '',
            tokens: null,
            symbols: null,
            sendFrom: '',
            sendTo: '',
            decimalsFrom: 18,
            decimalsTo: 18,
            prepareData: false,
        }
    }

    _isMounted = false
    componentDidMount() {
        this._isMounted = true
        this.initData()

    }

    componentWillUnmount() {
        this._isMounted = false
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.Send !== this.state.Send
            || prevState.Recive !== this.state.Recive
            || prevState.AmountSend !== this.state.AmountSend
            || prevState.AmountRecive !== this.state.AmountRecive
        ) {
            this.setState({ ERRORText: '' })
        }
    }

    // get tokens addresses and symbols from paraswap api
    initData = async () => {
        if (NeworkID === 1) {
            // get tokens from api
            try {
                const tokenEndpoint = `${OneInchApi}/1inchToken/${NeworkID}`;
                const response = await axios.get(tokenEndpoint);
                const tokens = [];
                const symbols = [];

                for (const [, value] of Object.entries(response.data.data.tokens)) {
                    symbols.push(value.symbol);
                    tokens.push({
                        symbol: value.symbol,
                        address: value.address,
                        decimals: value.decimals
                    });
                }
                if (this._isMounted) {
                    this.setState({ tokens, symbols });
                }
            } catch (e) {
                console.error(e);
                alert("Can not get data from the API, please try again later");
            }
        } else if (NeworkID === 97) {
            // just provide for test a few testnet tokens from storage
            const tokens = testnetTokens;
            const symbols = testnetSymbols;
            this.setState({ tokens, symbols });
        } else {
            alert("There are no tokens for your ETH network");
        }
    }

    // Show err msg if there are some msg
    ErrorMsg = () => {
        if (this.state.ERRORText.length > 0) {
            return (
                <Alert variant="danger">
                    <AlertIcon />
                    {this.state.ERRORText}
                </Alert>
            )
        } else {
            return null
        }
    }


    // Check if fund has assets for certain token
    // return true if fund has enougth balance
    checkFundBalance = async () => {
        let fundBalance
        let result = false
        if (String(this.state.sendFrom).toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            fundBalance = await this.props.web3.eth.getBalance(this.props.smartFundAddress)
            fundBalance = this.props.web3.utils.fromWei(fundBalance, 'ether')
        }
        else {
            const ERC20 = new this.props.web3.eth.Contract(ERC20ABI, this.state.sendFrom)
            fundBalance = await ERC20.methods.balanceOf(this.props.smartFundAddress).call()
            fundBalance = fromWeiByDecimalsInput(this.state.decimalsFrom, fundBalance)

        }
        if (parseFloat(fundBalance) >= parseFloat(this.state.AmountSend))
            result = true

        return result
    }


    // helper for update state
    change = async e => {
        // Update rate in correct direction order and set state
        if (e.target.name === "AmountSend") {
            this.setState({ shouldUpdatePrice: true, slippageTo: 0, slippageFrom: 0 })
            // get data
            const targetName = e.target.name
            const targerValue = e.target.value
            const { sendFrom, sendTo, decimalsFrom, decimalsTo } = this.getDirectionInfo()
            // get rate and slippage in current order
            const amountRecive = await this.setRate(sendFrom, sendTo, targerValue, "AmountRecive", decimalsFrom, decimalsTo)
            const slippageFrom = await this.getSlippage(sendFrom, sendTo, targerValue, amountRecive, decimalsFrom, decimalsTo)
            // update states
            this.setState({
                [targetName]: targerValue,
                sendFrom,
                sendTo,
                decimalsFrom,
                decimalsTo,
                slippageFrom,
                slippageTo: 0,
                shouldUpdatePrice: false
            })
        }
        // Update rate in reverse order direction and set state
        else if (e.target.name === "AmountRecive") {
            this.setState({ shouldUpdatePrice: true, slippageTo: 0, slippageFrom: 0 })
            // get data
            const targetName = e.target.name
            const targerValue = e.target.value
            const { sendFrom, sendTo, decimalsFrom, decimalsTo } = this.getDirectionInfo()
            // update rate and slippage in vice versa order
            const amountRecive = await this.setRate(sendTo, sendFrom, targerValue, "AmountSend", decimalsTo, decimalsFrom)
            const slippageTo = await this.getSlippage(sendTo, sendFrom, targerValue, amountRecive, decimalsTo, decimalsFrom)
            // update states
            this.setState({
                [targetName]: targerValue,
                sendFrom,
                sendTo,
                decimalsFrom,
                decimalsTo,
                slippageFrom: 0,
                slippageTo,
                shouldUpdatePrice: false
            })
        }
        // Just set state by input
        else {
            this.setState({
                [e.target.name]: e.target.value
            })
        }
    }


    // helper for update state by click
    changeByClick = (name, param) => {
        this.setState({
            [name]: param,
            AmountSend: 0,
            AmountRecive: 0
        })
    }

    // found addresses and decimals by direction symbols
    getDirectionInfo = () => {
        const From = this.state.tokens.filter(item => item.symbol === this.state.Send)
        const decimalsFrom = From[0].decimals
        const sendFrom = From[0].address

        const To = this.state.tokens.filter(item => item.symbol === this.state.Recive)
        const decimalsTo = To[0].decimals
        const sendTo = To[0].address

        return { sendFrom, sendTo, decimalsFrom, decimalsTo }
    }


    // trade via 1 inch
    tradeViaOneInch = async () => {
        try {
            const smartFund = new this.props.web3.eth.Contract(SmartFundABIV7, this.props.smartFundAddress)
            const block = await this.props.web3.eth.getBlockNumber()
            // get cur tx count
            let txCount = await axios.get(APIEnpoint + 'api/user-pending-count/' + this.props.accounts[0])
            txCount = txCount.data.result;
            const amountInWei = toWeiByDecimalsInput(this.state.decimalsFrom, this.state.AmountSend)

            // TODO allow user select slippage  min return
            const minReturn = this.getMinReturn()

            // get gas price from local storage
            const gasPrice = localStorage.getItem('gasPrice') ? localStorage.getItem('gasPrice') : 2000000000

            // this function will throw execution with alert warning if there are limit
            await CheckTokensLimit(this.state.sendTo, smartFund)

            // get merkle tree data
            const { proof, positions } = getMerkleTreeData(this.state.sendTo)


            // get additional data from 1 inch api
            let additionalData

            try {
                const route = {
                    fromTokenAddress: this.state.sendFrom,
                    toTokenAddress: this.state.sendTo,
                    amount: amountInWei,
                    fromAddress: this.props.exchangePortalAddress.exchangePortalAddress,
                    slippage: 1,
                    disableEstimate: true
                };
                const data = JSON.stringify(route);
                const url = `${OneInchApi}/swap/${NeworkID}`;
                const response = await axios.post(url, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                additionalData = response.data.tx.data
            } catch (e) {
                alert("Can not prepare data from 1 inch api")
                console.log("1inch error ", e)
            }
            // trade
            smartFund.methods.trade(
                this.state.sendFrom,
                amountInWei,
                this.state.sendTo,
                0,
                proof,
                positions,
                additionalData,
                minReturn
            )
                .send({ from: this.props.accounts[0], gasPrice })
                .on('transactionHash', (hash) => {
                    // pending status for spiner
                    this.props.pending(true, txCount + 1)
                    // pending status for DB
                    setPending(this.props.smartFundAddress, 1, this.props.accounts[0], block, hash, "Trade")
                })

            this.props.closeModal()
        } catch (e) {
            this.setState({ ERRORText: 'Can not verify transaction data, please try again in a minute' })
            console.log("error: ", e)
        }
    }


    // Validation input and smart fund balance
    validation = async () => {
        if (this.state.AmountSend === 0) {
            this.setState({ ERRORText: 'Please input amount' })
        } else if (this.state.Send === this.state.Recive) {
            this.setState({ ERRORText: 'Token directions can not be the same' })
        }
        else {
            const status = await this.checkFundBalance()
            if (true) {
                this.setState({ prepareData: true })
                this.tradeViaOneInch()
            } else {
                this.setState({ ERRORText: `Your smart fund don't have enough ${this.state.Send}` })
            }
        }
    }

    /** dev get rate (can calculate by input to or from)
    * params
    * address from and to,
    * input tokens amount
    * type (direction Send or Recieve),
    * decimals token decimals
    */
    setRate = async (from, to, amount, type, decimalsFrom, decimalsTo) => {
        const value = await this.getRate(from, to, amount, decimalsFrom, decimalsTo)
        if (value) {
            const result = fromWeiByDecimalsInput(decimalsTo, value)
            this.setState({ [type]: result })
            return result
        } else {
            this.setState({ [type]: 0 })
            return 0
        }
    }


    gitRateByNetworkId = async (from, to, amount, decimalsFrom, decimalsTo) => {
        // get value from 1 inch proto
        if (NeworkID === 1) {
            const src = toWeiByDecimalsInput(decimalsFrom, amount.toString(10))
            try {
                return await this.getRateFrom1inchApi(from, to, src)
            } catch (e) {
                return 0
            }
        }
        // from test net get value from Bancor via old portal v
        else {
            const portal = new this.props.web3.eth.Contract(ExchangePortalABIV6, ExchangePortalAddressV7)
            const src = toWeiByDecimalsInput(decimalsFrom, amount.toString(10))
            return await portal.methods.getValueViaOneInch(
                from,
                to,
                src,
            ).call()
        }
    }

    // get ratio from 1inch or Paraswap (dependse of selected type)
    getRate = async (from, to, amount, decimalsFrom, decimalsTo) => {
        if (amount > 0 && from !== to) {
            return await this.gitRateByNetworkId(from, to, amount, decimalsFrom, decimalsTo)
        }
    }

    // get rate from api
    getRateFrom1inchApi = async (from, to, srcBN) => {
        const route = {
            fromTokenAddress: from,
            toTokenAddress: to,
            amount: srcBN
        };
        const data = JSON.stringify(route);
        const url = `${OneInchApi}/getQuote/${NeworkID}/`;
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data.toAmount;
    }

    // get slippage percent
    getSlippage = async (sendFrom, sendTo, amountSend, amountRecive, decimalsFrom, decimalsTo) => {
        try {
            const expectedRatio = new BigNumber(
                toWeiByDecimalsInput(decimalsTo, amountRecive)
            )
            const amountSendBN = new BigNumber(amountSend)
            const onePercentFromInput = amountSendBN.minus(amountSendBN.multipliedBy(99).dividedBy(100))
            const ratioForOnePercent = new BigNumber(await this.getRate(
                sendFrom,
                sendTo,
                onePercentFromInput,
                decimalsFrom,
                decimalsTo
            ))

            const realRatio = new BigNumber(ratioForOnePercent.multipliedBy(100))
            const difference = realRatio.minus(expectedRatio)

            const slippage = difference.dividedBy(expectedRatio.dividedBy(100))
            return slippage.dividedBy(2).toFixed(6)
        } catch (e) {
            return 0
        }
    }

    // TODO: User can select slipapge percent
    // cut 5% slippage for min return
    getMinReturn() {
        const amountReceive = toWeiByDecimalsInput(this.state.decimalsTo, this.state.AmountRecive)
        const result = new BigNumber(String(amountReceive)).multipliedBy(95).dividedBy(100)
        return BigNumber(BigNumber(result).integerValue()).toString(10)
    }

    // update state only when user stop typing
    delayChange = (e) => {
        e.persist()
        this.setState({ [e.target.name]: e.target.value })
        if (this._timeout) { //if there is already a timeout in process cancel it
            clearTimeout(this._timeout)
        }
        this._timeout = setTimeout(async () => {
            this._timeout = null
            await this.change(e)
        }, 1000)
    }

    // extract address from global tokens obj by symbol
    getTokenAddressBySymbol = (symbol) => {
        const From = this.state.tokens.filter(item => item.symbol === symbol)
        return String(From[0].address).toLowerCase()
    }

    // props for SelectToken component
    onChangeTypeHead = (name, param) => {
        this.setState({
            [name]: param,
            AmountSend: 0,
            AmountRecive: 0
        })
    }

    pushNewTokenInList = (tokenSymbol, tokenData) => {
        const symbols = this.state.symbols
        const tokens = this.state.tokens

        if (!symbols.includes(tokenSymbol)) {
            symbols.push(tokenSymbol)
            tokens.push(tokenData)

            this.setState({
                symbols,
                tokens
            })
        }
        else {
            alert(`${tokenSymbol} alredy in list`)
        }
    }

    render() {
        return (
            <>
                {this.state.tokens ? (
                    <Box>
                        {/* SEND */}
                        <FormControl>
                            <FormLabel>Pay with</FormLabel>
                            <InputGroup >
                                <SelectToken
                                    web3={this.props.web3}
                                    symbols={this.state.symbols}
                                    tokens={this.state.tokens}
                                    onChangeTypeHead={this.onChangeTypeHead}
                                    direction="Send"
                                    currentSymbol={this.state.Send}
                                    pushNewTokenInList={this.pushNewTokenInList}
                                />
                                <Input
                                    type="number"
                                    placeholder={this.state.AmountSend}
                                    min={0}
                                    name="AmountSend"
                                    value={this.state.AmountSend}
                                    onChange={e => this.delayChange(e)}
                                />
                            </InputGroup>
                            {
                                this.state.slippageTo > 0
                                    ?
                                    (
                                        <Text style={{ color: "blue" }}>Slippage: {String(this.state.slippageTo)} %</Text>
                                    ) : null
                            }

                            {
                                this.state.shouldUpdatePrice ? (<Pending />) : null
                            }
                            <br />

                            {/* RECEIVE */}
                            <FormLabel>Receive</FormLabel>
                            <InputGroup >
                                <SelectToken
                                    web3={this.props.web3}
                                    symbols={this.state.symbols}
                                    tokens={this.state.tokens}
                                    onChangeTypeHead={this.onChangeTypeHead}
                                    direction="Recive"
                                    currentSymbol={this.state.Recive}
                                    pushNewTokenInList={this.pushNewTokenInList}
                                />
                                <Input
                                    type="number"
                                    placeholder={this.state.AmountRecive}
                                    min={0}
                                    name="AmountRecive"
                                    value={this.state.AmountRecive}
                                    onChange={e => this.delayChange(e)}
                                />
                            </InputGroup>
                            {
                                this.state.slippageFrom > 0
                                    ?
                                    (
                                        <Text mt={2} style={{ color: "red" }}>Slippage: {String(this.state.slippageFrom)} %</Text>
                                    ) : null
                            }

                            {/* Display error */}
                            {this.ErrorMsg()}

                            {/* Trigger tarde */}

                            <Button mt={4} colorScheme='green' onClick={() => this.validation()}>Trade</Button>

                            {
                                this.state.prepareData ? (<Text mt={1}>Preparing transaction data, please wait ...</Text>) : null
                            }
                        </FormControl>
                    </Box>
                ) : (
                    <Text>Data Load.....</Text>
                )
                }




            </>
        )
    }
}
export default TradeViaOneInch

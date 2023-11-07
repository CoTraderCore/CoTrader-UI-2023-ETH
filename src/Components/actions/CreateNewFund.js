import React, { useState } from 'react'
import { APIEnpoint, SmartFundRegistryABIV9, SmartFundRegistryADDRESS } from '../../config.js'
import { Tooltip,useColorModeValue,Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, Box, FormControl, Checkbox,  FormLabel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Stack, Input, InputLeftAddon, InputGroup, Select, } from '@chakra-ui/react'
import setPending from '../../utils/setPending'
import UserInfo from '../template/UserInfo.js'
import axios from 'axios'

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USD_ADDRESS = '0xe9e7cea3dedca5984780bafc599bd69add087d56'

function CreateNewFund(props) {

    const [show, setShow] = useState(false);
    const [percent, setPercent] = useState();
    const [fundAsset, setFundAsset] = useState('ETH');
    const [fundName, setFundName] = useState('');
    const [tradeVerification, setTradeVerification] = useState(true);
    const createNewFund = async () => {
        if (percent > 0 && percent <= 30) {
            const contract = new props.web3.eth.Contract(SmartFundRegistryABIV9, SmartFundRegistryADDRESS);
            if (fundName !== '') {
                try {
                    const name = fundName;
                    const percentMultiplier = 100;
                    const verified = tradeVerification;
                    const block = await props.web3.eth.getBlockNumber();
                    const coreAsset = fundAsset === 'ETH' ? ETH_ADDRESS : USD_ADDRESS;

                    console.log(name, percent, coreAsset, verified, fundAsset);

                    // get current tx count
                    let txCount = await axios.get(APIEnpoint + 'api/user-pending-count/' + props.accounts[0]);
                    txCount = txCount.data.result;

                    // create fund
                    contract.methods
                        .createSmartFund(name, percent * percentMultiplier, coreAsset, verified)
                        .send({ from: props.accounts[0] })
                        .on('transactionHash', (hash) => {
                            // pending status for DB
                            setPending(null, 1, props.accounts[0], block, hash, 'SmartFundCreated');
                            props.pending(true, txCount + 1);
                        });
                    // close modal
                    modalClose();
                } catch (e) {
                    // for case if user rejects transaction
                    props.pending(false);
                    alert('Can not verify transaction data, please try again in a minute');
                    console.log('Error', e);
                }
            } else {
                alert('Please input fund name');
            }
        } else {
            alert('Please select correct percent, we support from 0.01% to 30%');
        }
    };

    const change = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'FundName':
                setFundName(value);
                break;
            case 'Percent':
                setPercent(value);
                break;
            case 'FundAsset':
                setFundAsset(value);
                break;
            case 'TradeVerification':
                setTradeVerification(!tradeVerification); // Negate the current value
                break;
            default:
                break;
        }
    };
    const modalOpen = () => {
        setShow(true);
    };

    const modalClose = () => {
        setShow(false);
        setPercent(20);
        setFundAsset('ETH');
        setFundName('');
        setTradeVerification(true);
    };
    const allbtnBg = useColorModeValue("#039be5", "#039be5")
    const allbtntxtcolor=useColorModeValue("#fff","gray.200")
    return (
        <React.Fragment>
        {
            !props.web3 ? (
                <Tooltip hasArrow label="Please connect to web3">
                    <Button flexGrow="1" minWidth={{ base: '100%', sm: "auto" }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" },padding:"0 50px" }}> Create fund</Button>
                </Tooltip>
            ) : (
                <Button bg={allbtnBg} color={allbtntxtcolor} flexGrow="1" width={{base:"100%",md:"auto"}} sx={{ _hover: { backgroundColor: "#027CB8" },padding:"0 50px" }} onClick={modalOpen} >
                Create fund
            </Button>
            )
        }
            <Modal
                isOpen={show} onClose={modalClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader closeButton>
                        Create new fund <small>(with multi DEX support)</small>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <InputGroup width="100%">
                                <Input
                                    style={{ width: "100%" }}
                                    name="FundName"
                                    placeholder='Fund name'
                                    value={fundName}
                                    onChange={e => change(e)}
                                />
                            </InputGroup>
                            <FormLabel mt={5} display={'flex'}>Performance Fee % <UserInfo info="This is the % the fund manager earns for the profits earned, relative to main fund asset (ETH, USD or COT)." /></FormLabel>
                            <InputGroup width="100%">
                                <InputLeftAddon children="%" />
                                <NumberInput width="100%" value={percent} onChange={(value) => setPercent(value)} min={1} >
                                    <NumberInputField id="outlined-name" type="number" placeholder="20" name="Percent" sx={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </InputGroup>
                            <FormLabel mt={5} display={'flex'}>Main fund asset % <UserInfo info="With the help of this asset, investors will invest, calculate fund value ect" /></FormLabel>
                            <Select name="FundAsset" onChange={change}>
                                <option value="ETH">ETH</option>
                                <option value="USD">USD</option>
                            </Select>
                            <FormLabel mt={5} display={'flex'}>Limit Tokens <UserInfo info="This gives investors confidence that even if the trader's key is stolen, the worst a hacker can do is trade to legit tokens, not likely to a token just created by the trader to exit scam the fund, leaving it without value." /></FormLabel>

                            <Stack spacing={5} direction='row'>
                                <Checkbox colorScheme='red'
                                    checked={tradeVerification}
                                    onChange={() => setTradeVerification({ tradeVerification: !tradeVerification })}
                                >
                                    Use trade varification
                                </Checkbox>
                            </Stack>
                            <Button
                                mt={5}
                               colorScheme='green'
                               variant='outline'
                                onClick={() => createNewFund()}
                            >
                                Create
                            </Button>
                        </FormControl>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    )
}
export default CreateNewFund;

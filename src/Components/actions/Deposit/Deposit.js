import React, { useState } from 'react'
import { useColorModeValue, Modal, ModalOverlay, ModalBody, Button, ModalContent, ModalCloseButton, ModalHeader, OrderedList, ListItem, Stack, Checkbox, Text, FormControl, Tooltip, Alert } from '@chakra-ui/react'
import DepositETH from './DepositETH'
import DepositERC20 from './DepositERC20'
// import { inject,observer } from 'mobx-react'

function Deposit(props) {
    const [show, setShow] = useState(false);
    const [agree, setAgree] = useState(false);

    const modalClose = () => {
        setShow(false);
        setAgree(false);
    };
    const allbtnBg = useColorModeValue("#039be5", "#039be5")
    const toggleAgree = () => {
        setAgree(!agree);
    };
    return (
        <React.Fragment>
            {
                !props.web3 ? (
                    <Tooltip hasArrow label="Please connect to web3">
                        <Button flexGrow="1" minWidth={{ base: '100%', sm: "auto" }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>Deposit</Button>
                    </Tooltip>
                ) : (
                    <Button onClick={() => setShow(true)} flexGrow="1" minWidth={{ base: '100%', sm: "auto" }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>Deposit</Button>
                )
            }
            <Modal isOpen={show} onClose={modalClose} size={{ base: "lg", md: "xl" }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Terms and Conditions</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <OrderedList>
                            <ListItem>I certify that I'm not a USA citizen or resident.</ListItem>
                            <ListItem>I understand CoTrader technology is new and is not to be trusted.</ListItem>
                            <ListItem>I understand that CoTrader aims to protect investors with technology regulation, that aims to prove fees, fair play, and past performance.</ListItem>
                            <ListItem>I understand I shouldn't deposit anything I can't afford to lose.</ListItem>
                        </OrderedList>
                        <Stack mt={2} spacing={[1]} direction={['column']}>
                            <Checkbox size='md' colorScheme='red' onChange={toggleAgree} />
                            <Text>I agree to the above Terms and Conditions to use this product. By cancelling you will not gain access to the service.</Text>
                        </Stack>
                        {
                            agree ? (
                                <FormControl>
                                    {
                                        props.mainAsset === "ETH" || props.mainAsset === "ETH"
                                            ?
                                            (
                                                <DepositETH
                                                    mainAsset={props.mainAsset}
                                                    accounts={props.accounts}
                                                    address={props.address}
                                                    web3={props.web3}
                                                    pending={props.pending}
                                                    modalClose={modalClose}
                                                />
                                            ) :
                                            (
                                                <DepositERC20
                                                    mainAsset={props.mainAsset}
                                                    accounts={props.accounts}
                                                    address={props.address}
                                                    web3={props.web3}
                                                    pending={props.pending}
                                                    modalClose={modalClose}
                                                />
                                            )
                                    }
                                </FormControl>
                            ) :
                                (null)
                        }
                        {
                            props.version < 7
                                ?
                                (

                                    <Alert mt={3} status="error" >{`We recommend depositing only to funds version 7 and higher, version of this fund is ${props.version}`}</Alert>
                                ) : null
                        }

                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    )
}
export default Deposit;
// export default inject('MobXStorage')(observer(Deposit)) 

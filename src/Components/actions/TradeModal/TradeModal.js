import React, { useState, useEffect } from 'react';
import {
  SmartFundABIV7,
  ExchangePortalABIV6
} from '../../../config.js';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';

import MigrateToNewPortal from '../MigrateToNewPortal.js';
import SetGasPrice from '../../Settings/SetGasPrice.js';

// trade modals
// import TradeViaOneInch from './TradeViaOneInch';
import TradeViaCoSwap from './TradeViaCoSwap';
import TradeViaPancake from './TradeViaPanCake.js';


function TradeModal(props) {
  const [exchangePortalAddress, setExchangePortalAddress] = useState('');
  const [exchangePortalVersion, setExchangePortalVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {

      const exchangePortalVersion = await getExchangePortalVersion(props.smartFundAddress);

      const exchangePortalAddress = await getExchangePortalVersion(props.smartFundAddress)

      if (isMounted) {
        setExchangePortalAddress(exchangePortalAddress);
        setExchangePortalVersion(exchangePortalVersion);
      }

    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [props.smartFundAddress]);

  const getExchangePortalVersion = async (fundAddress) => {
  
      const smartFund = new props.web3.eth.Contract(SmartFundABIV7, fundAddress);
      const exchangePortalAddress = await smartFund.methods.exchangePortal().call();
      const exchangePortal = new props.web3.eth.Contract(ExchangePortalABIV6, exchangePortalAddress);
      const exchangePortalVersion = Number(await exchangePortal.methods.version().call());
      return { exchangePortalAddress, exchangePortalVersion };
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalbg = useColorModeValue("#fff", "gray.700")
  const allbtnBg = useColorModeValue("#039be5", "#039be5")

  return (
    <>
      <Button flexGrow="1" width={{ base: "100%", md: "auto" }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }} onClick={onOpen}>
        Exchange
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "lg", md: "2xl" }}>
        <ModalOverlay />
        <ModalContent bg={modalbg}>
          <ModalHeader>Exchange</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs defaultIndex={0}>
              <TabList>
                {/* <Tab>1 inch</Tab> */}
                <Tab>CoSwap</Tab>
                <Tab> Pancake</Tab>
              </TabList>
              <TabPanels>
                {/* 
                <TabPanel>
                  <TradeViaOneInch
                    web3={props.web3}
                    accounts={props.accounts}
                    smartFundAddress={props.smartFundAddress}
                    pending={props.pending}
                    version={props.version}
                    exchangePortalAddress={exchangePortalAddress}
                    closeModal={onClose}
                  />
                </TabPanel> 
                */}
                <TabPanel>
                  <TradeViaCoSwap
                    web3={props.web3}
                    accounts={props.accounts}
                    smartFundAddress={props.smartFundAddress}
                    pending={props.pending}
                    version={props.version}
                    exchangePortalAddress={exchangePortalAddress}
                    closeModal={onClose}
                  />
                </TabPanel>
                <TabPanel>
                  <TradeViaPancake
                    web3={props.web3}
                    accounts={props.accounts}
                    smartFundAddress={props.smartFundAddress}
                    pending={props.pending}
                    version={props.version}
                    exchangePortalAddress={exchangePortalAddress}
                    closeModal={onClose}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* check if need update portal */}
            <MigrateToNewPortal
              exchangePortalAddress={exchangePortalAddress}
              web3={props.web3}
              accounts={props.accounts}
              smartFundAddress={props.smartFundAddress}
              closeModal={onClose}
            />

            {/* Update gas price */}
            <br />
            {props.web3 ? <SetGasPrice web3={props.web3} /> : null}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}

export default TradeModal;

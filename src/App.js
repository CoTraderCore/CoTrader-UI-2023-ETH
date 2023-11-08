import React, { useState, useEffect } from 'react';
import {
  Box,
  ChakraProvider,
  Grid,
  GridItem,
  useColorMode,
  useDisclosure,
  ColorModeProvider,
  CSSReset,
} from '@chakra-ui/react';
import themes from './Theme/Theme';
import ReactGA from 'react-ga';
import getFundsList from './utils/getFundsList';
import SmartFundList from './Pages/SmartFundList/Index';
import ViewFundTx from './Pages/ViewFundTx';
import ViewUserTx from './Pages/ViewUserTx';
import ViewFund from './Pages/ViewFund';
import ViewUser from './Pages/ViewUser';
import HowToStart from './Pages/HowToStart';
import { inject } from 'mobx-react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Navbar from './Components/common/Navbar';
import Sidebar from './Components/common/Sidebar';

function App(props) {
  const [isDataLoad, setIsDataLoad] = useState(false);

  useEffect(async () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }

    async function load() {
      initializeReactGA();
      initData();
    }
    load()
  }, [props.MobXStorage]);


  const initializeReactGA = () => {
    ReactGA.initialize('UA-141893089-1');
    ReactGA.pageview('/');
  };

  const initData = async () => {
    if (props.MobXStorage.SmartFundsOriginal.length === 0) {
      try {
        const smartFunds = await getFundsList();
        props.MobXStorage.initSFList(smartFunds);
        setIsDataLoad(true);
      } catch (error) {
        console.log("error:", error);
      }
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  return (
    <React.Fragment>
      <HashRouter>
        <ChakraProvider theme={themes}>
          <ColorModeProvider>
            <CSSReset />
            <Box
              sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative"
              }}
            >
              <Navbar toggleColorMode={toggleColorMode} />
              <Grid sx={{ display: 'flex', flexWrap: "nowrap", overflow: "auto", height: "90vh", }} >
                <GridItem >
                  <Sidebar isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
                </GridItem>
                <GridItem className='example' sx={{ flexGrow: 1, overflow: "auto", }}>
                  <Switch>
                    <Route exact path="/" render={() => <SmartFundList MobXStorage={props.MobXStorage} isDataLoad={isDataLoad} setIsDataLoad={setIsDataLoad} />} />
                    <Route path="/fund/:address" render={() => <ViewFund MobXStorage={props.MobXStorage} />} />
                    <Route path="/user-txs/:address" render={() => <ViewUserTx MobXStorage={props.MobXStorage} isDataLoad={isDataLoad} />} />
                    <Route path="/fund-txs/:address" render={() => <ViewFundTx MobXStorage={props.MobXStorage} isDataLoad={isDataLoad} />} />
                    <Route path="/user/:address" render={() => <ViewUser MobXStorage={props.MobXStorage} />} />
                    <Route path="/how-to-start" render={() => <HowToStart MobXStorage={props.MobXStorage} />} />
                  </Switch>
                </GridItem>
              </Grid>
            </Box>
          </ColorModeProvider>
        </ChakraProvider>
      </HashRouter>
    </React.Fragment>
  );
}

export default inject('MobXStorage')(App);

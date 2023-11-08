import React, { useEffect, useState, useRef } from 'react'
import { Alert, AlertIcon, Box, Grid, GridItem, Icon, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import CreateNewFund from '../../Components/actions/CreateNewFund';
import FilterSearch from '../../Components/Filter&Search/FilterSearch';
import SortFunds from '../../Components/navigation/SortFunds';
import IconBox from '../../Components/Icons/IconBox';
import Footer from '../../Components/common/footer/Footer';
import SmartfundTabs from '../../Components/Tabs/SmartFundTabs'
import { MdOutlineBarChart } from 'react-icons/md'
import { FcComboChart } from 'react-icons/fc'
import { RiFundsBoxLine } from 'react-icons/ri'
import ShadowBox from '../../Components/Cards/ShadowBox';
import PopupMsg from '../../Components/template/PopupMsg';
import axios from 'axios';
import { io } from 'socket.io-client';
import { APIEnpoint,NeworkID } from '../../config';
import getFundData from '../../utils/getFundData';
import getFundsList from '../../utils/getFundsList';
import Pending from '../../Components/template/spiners/Pending';
import { observer, inject } from 'mobx-react';
import Loading from '../../Components/template/spiners/Loading';
import WalletInfo from '../../Components/common/WalletInfo';
import DashboardHeader from '../../Components/common/DashboardHeader';
function SmartFundList(props) {

  const [pending, setPending] = useState(false);
  const [txName, setTxName] = useState('');
  const [txHash, setTxHash] = useState('');
  const [lastHash, setLastHash] = useState('');
  const [txCount, setTxCount] = useState(0);

  const _popupChild = useRef(null);
  const _isMounted = useRef(true);

  useEffect(() => {
    const initSocket = () => {
      const socket = io(APIEnpoint);
      socket.on('connect', () => {
        socket.on('AddedNewSmartFund', (address, hash, user) => {
          txUpdate('added new fund', address, user, hash);
        });

        socket.on('Deposit', (address, hash, user) => {
          txUpdate('deposit', address, user, hash);
        });

        socket.on('Withdraw', (address, hash, user) => {
          txUpdate('withdraw', address, user, hash);
        });
      });
    };

    const updateSFList = async () => {
      const smartFunds = await getFundsList();
      props.MobXStorage.initSFList(smartFunds);
      checkPending();
    };

    const updateSingleSF = async (address) => {
      checkPending();
      const fund = await getFundData(address);
      if (_popupChild.current) {
        _popupChild.current.UpdateValue(
          fund.data.result.profitInETH,
          fund.data.result.profitInUSD,
          fund.data.result.valueInETH,
          fund.data.result.valueInUSD
        );
      }
    };

    const checkPending = async () => {
      if (props.MobXStorage.account) {
        let txCount = await axios.get(APIEnpoint + 'api/user-pending-count/' + props.MobXStorage.account[0]);
        txCount = txCount.data.result;
        const pending = Number(txCount) === 0 ? false : true;
        if (_isMounted.current) {
          setPending(pending);
          setTxCount(txCount);
        }
      }
    };

    const showPopup = () => {
      if (_popupChild.current) {
        _popupChild.current.show();
      }
    };

    const txUpdate = (txName, address, user, hash) => {
      if (props.MobXStorage.account[0] === user && lastHash !== hash) {
        if (_isMounted.current) {
          setLastHash(hash);
          setTxName(txName);
          setTxHash(hash);
          checkPending();

          if (txName === 'added new fund') {
            updateSFList();
          } else {
            updateSingleSF(address);
          }

          showPopup();
        }
      }
    };

    _isMounted.current = true;
    initSocket();
    checkPending();

    return () => {
      _isMounted.current = false;
    };
  }, [props.MobXStorage]);

  const pendingg = (_bool, _txCount) => {
    setPending(_bool);
    setTxCount(_txCount);
  };

  const brandColor = useColorModeValue("#7500fe", "##CBC3E3");
  const boxBg = useColorModeValue("#F4F7FE", "gray.600");
  const allbtnBg = useColorModeValue("#039be5", "#039be5")
  console.log("MobXStorage=", props.MobXStorage)

  return (
    <React.Fragment>
    {
      props.MobXStorage.netId && NeworkID !== props.MobXStorage.netId
        ?
        (
          <Alert status="error" sx={{ color: "red", fontSize: "sm",fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",textTransform:"uppercase" }}><AlertIcon color="red" />please change MetaMask to ETH network</Alert>
        )
        : null
    }
    <Box mt={2} px={2}>
      <DashboardHeader />
    </Box>
      {
        props.isDataLoad ?
          (
            <Box className='dashboard' style={{ padding: "10px", }}>
              <WalletInfo web3={props.MobXStorage.web3} accounts={props.MobXStorage.account} />
              <PopupMsg txName={txName} txHash={txHash} ref={_popupChild} />
              {
                pending ? (
                  <Box>
                    <Text mt={4} sx={{ fontWeight: "500", textAlign: "center", borderRadius: "5px", padding: "10px 5px", boxShadow: "1px 1px 1px 1px gray", border: "1px solid white" }}>
                      Pending transitions : {txCount}
                    </Text>
                    <Pending />
                  </Box>
                ) :
                  (null)
              }
              <Grid py={5} gap={4} templateColumns={['1fr', 'repeat(3, 1fr)']} sx={{ borderRadius: "5px", display: "flex", justifyContent: "space-around", flexDirection: { base: "column", sm: "column", md: "row" }, textAlign: { base: "center", sm: "center" } }}>
                <GridItem >
                  <CreateNewFund web3={props.MobXStorage.web3} accounts={props.MobXStorage.account} pending={pendingg} />
                </GridItem>
                <GridItem >
                  <FilterSearch MobXStorage={props.MobXStorage} />
                </GridItem>
                <GridItem >
                  <Stack bg={allbtnBg} sx={{ color: "#fff", borderRadius: "8px", border: "none", _hover: { backgroundColor: "#027CB8" } }}>
                    <SortFunds />
                  </Stack>
                </GridItem>
              </Grid>
              <Box>
                {
                  !props.MobXStorage.FilterActive ?
                    (
                      <SimpleGrid
                        width="100%"
                        columns={{ base: 1, md: 4, lg: 4, }}
                        gap='20px'
                        mb='20px'>
                        <ShadowBox
                          startContent={
                            <IconBox
                              w='56px'
                              h='56px'
                              bg={boxBg}
                              icon={
                                <Icon w='32px' h='32px' as={RiFundsBoxLine} color={brandColor} />
                              }
                            />
                          }
                          name='Total Funds'
                          value={props.MobXStorage.SmartFundsOriginal.length}
                        />
                        <ShadowBox
                          startContent={
                            <IconBox
                              w='56px'
                              h='56px'
                              bg={boxBg}
                              icon={
                                <Icon w='32px' h='32px' as={FcComboChart} color={brandColor} />
                              }
                            />
                          }
                          name='Total value'
                          value={`$ ${props.MobXStorage.TotalValue}`}
                        />
                        <ShadowBox
                          startContent={
                            <IconBox
                              w='56px'
                              h='56px'
                              bg={boxBg}
                              icon={
                                <Icon w='32px' h='32px' as={MdOutlineBarChart} color={brandColor} />
                              }
                            />
                          }
                          name='Total profit'
                          value={`$ ${props.MobXStorage.TotalProfit}`}
                        />
                        <ShadowBox
                          startContent={
                            <IconBox
                              w='56px'
                              h='56px'
                              bg={boxBg}
                              icon={<Icon w='28px' h='28px' as={MdOutlineBarChart} color={brandColor} />}
                            />
                          }
                          name='History total profit'
                          value={`$ ${props.MobXStorage.HistoryTotalProfit}`}
                        />
                      </SimpleGrid>
                    ) :
                    (
                      <Box>
                        <Text mb={2} bg="transparent" border="1px solid lightgray" boxShadow="1px 1px 1px 1px gray" borderRadius={5} sx={{ textTransform: "capitalize", fontWeight: "500", color: "#039be5", textAlign: "center" }}>{props.MobXStorage.FilterInfo}</Text>
                        <SimpleGrid
                          width="100%"
                          columns={{ base: 1, md: 4, lg: 4, }}
                          gap='20px'
                          mb='20px'>
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={
                                  <Icon w='32px' h='32px' as={RiFundsBoxLine} color={brandColor} />
                                }
                              />
                            }
                            name='Fund'
                            value={`${props.MobXStorage.SmartFunds.length} of ${props.MobXStorage.SmartFundsOriginal.length} funds`}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={
                                  <Icon w='32px' h='32px' as={FcComboChart} color={brandColor} />
                                }
                              />
                            }
                            name='Total value'
                            value={`$ ${props.MobXStorage.userTotalValue}`}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={
                                  <Icon w='32px' h='32px' as={MdOutlineBarChart} color={brandColor} />
                                }
                              />
                            }
                            name='Total profit'
                            value={`$ ${props.MobXStorage.userTotalProfit}`}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={<Icon w='28px' h='28px' as={MdOutlineBarChart} color={brandColor} />}
                              />
                            }
                            name='History total profit'
                            value={`$ ${props.MobXStorage.userHistoryTotalProfit}`}
                          />
                        </SimpleGrid>
                      </Box>
                    )
                }

              </Box>
              <SimpleGrid>
                <SmartfundTabs pending={pendingg} loadData={props.isDataLoad} MobXStorage={props.MobXStorage} />
              </SimpleGrid>
              <Footer />
            </Box>
          ) : (
            <Loading />
          )
      }
    </React.Fragment>

  );

}

// export default SmartFundList;
export default inject('MobXStorage')(observer(SmartFundList));

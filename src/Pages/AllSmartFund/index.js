import React, { useState } from 'react'
import PagePagination from '../../Components/navigation/Pagination/PagePagination';
import { Box, Heading, Icon, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { MdAttachMoney } from 'react-icons/md'
import { fromWei } from 'web3-utils';
import ShadowBox from '../../Components/Cards/ShadowBox';
import EtherscanButton from '../../Components/actions/EtherscanButton';
import IconBox from '../../Components/Icons/IconBox';
import Deposit from '../../Components/actions/Deposit/Deposit';
import Withdraw from '../../Components/actions/Withdraw/Withdraw';
import UserHoldings from '../../Components/actions/UserHoldings';
import { inject, observer} from 'mobx-react';
import FundPagebtn from '../../Components/actions/FundPagebtn';

function AllSmartFund(props) {
  const [currentPage, setCurrentPage] = useState(1)
  const headingColor = useColorModeValue("#1B2559", "#F4F7FE");
  const brandColor = useColorModeValue("#422AFB", "##CBC3E3");
  const boxBg = useColorModeValue("#F4F7FE", "gray.600");
  return (
          <React.Fragment>
            <Box gap={5} display="flex" flexDirection="column">
              {
                props.MobXStorage.SmartFunds.length > 0 ? (
                  props.MobXStorage.SmartFunds.map((item, key) =>
                    <Box key={item.address} px={4} sx={{ borderRadius: "20px", boxShadow: "1px 1px 2px 1px darkgray" }}>
                      <Box mt={2} sx={{ borderRadius: "10px", }}>
                        <Heading textTransform={"uppercase"} fontSize={{ base: "2xl" }} color={headingColor} textAlign={'center'} p={2}>Fund name: {item.name}</Heading>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Box justifyContent="center" gap={5} sx={{ display: "flex", flexDirection: { base: "column", sm: "column", md: "row" }, width: { base: "100%", md: "90%", lg: "80%" } }}>
                          <Deposit
                            web3={props.web3}
                            address={item.address}
                            accounts={props.accounts}
                            mainAsset={item.mainAsset}
                            pending={props.pending}
                            version={item.version}
                          />
                          <Withdraw
                            web3={props.web3}
                            address={item.address}
                            accounts={props.accounts}
                            pending={props.pending}
                            version={item.version}
                            mainAsset={item.mainAsset}
                          />
                         <FundPagebtn address={item.address} web3={props.web3}/>
                          <UserHoldings
                            web3={props.web3}
                            address={item.address}
                            accounts={props.accounts}
                          />
                          <EtherscanButton address={item.address} web3={props.web3} />
                        </Box>
                      </Box>
                      <Box>
                        <SimpleGrid
                          pt={5}
                          width="100%"
                          columns={{ base: 1, md: 2, lg: 4, }}
                          gap='20px'
                          mb='20px'>
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={
                                  <Icon w='32px' h='32px' as={MdAttachMoney} color={brandColor} />
                                }
                              />
                            }
                            name='Fund profit in ETH'
                            value={fromWei(String(item.profitInETH), 'ether')}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={
                                  <Icon w='32px' h='32px' as={MdAttachMoney} color={brandColor} />
                                }
                              />
                            }
                            name='Fund profit in USD'
                            value={fromWei(String(item.profitInUSD), 'ether')}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={<Icon w='28px' h='28px' as={MdAttachMoney} color={brandColor} />}
                              />
                            }
                            name='Fund value in ETH'
                            value={fromWei(String(item.valueInETH), 'ether')}
                          />
                          <ShadowBox
                            startContent={
                              <IconBox
                                w='56px'
                                h='56px'
                                bg={boxBg}
                                icon={<Icon w='28px' h='28px' as={MdAttachMoney} color={brandColor} />}
                              />
                            }
                            name='Fund value in USD'
                            value={fromWei(String(item.valueInUSD), 'ether')}
                          />
                        </SimpleGrid>
                      </Box>
                    </Box>
                  )
                ) :
                  (
                    null
                  )
              }
            </Box>
            {
              !props.MobXStorage.FilterActive ? (
                <PagePagination currentPage={currentPage} setCurrentPage={setCurrentPage} MobXStorage={props.MobXStorage} />
              ) : (
                null
              )
            }
          </React.Fragment>
  );
}
export default inject('MobXStorage')(observer(AllSmartFund));

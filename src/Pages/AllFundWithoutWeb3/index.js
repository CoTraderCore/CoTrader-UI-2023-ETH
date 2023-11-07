import React, { useState } from 'react'
import ShadowBox from '../../Components/Cards/ShadowBox'
import { Box, SimpleGrid, Heading, useColorModeValue, Tooltip, Button } from '@chakra-ui/react'
import IconBox from '../../Components/Icons/IconBox';
import { Icon } from '@chakra-ui/react';
import { MdAttachMoney } from 'react-icons/md'
import EtherscanButton from '../../Components/actions/EtherscanButton';
import { fromWei } from 'web3-utils';
import PagePagination from '../../Components/navigation/Pagination/PagePagination';
import { inject, observer } from 'mobx-react';
import { NavLink } from 'react-router-dom';

function AllFundWithoutWeb3(props) {
    const [currentPage, setCurrentPage] = useState(1)
    const headingColor = useColorModeValue("#1B2559", "#F4F7FE");
    const brandColor = useColorModeValue("#422AFB", "##CBC3E3");
    const boxBg = useColorModeValue("#F4F7FE", "gray.600");
    const tooltipBg = useColorModeValue("black", "#A4ADC7")
    const allbtnBg = useColorModeValue("#039be5", "#039be5")

    return (
                    <Box gap={5} display="flex" flexDirection="column">
                        {
                            props.MobXStorage.SmartFunds.map((item, key) =>
                                <Box key={item.address} px={4} sx={{ borderRadius: "20px", boxShadow: "1px 1px 2px 1px darkgray" }}>
                                    <Box mt={2} sx={{ borderRadius: "10px", }}>
                                        <Heading textTransform={"uppercase"} fontSize={{ base: "2xl" }} color={headingColor} textAlign={'center'} p={2}>{item.name}</Heading>
                                    </Box>
                                    <Box mt={4} display="flex" justifyContent="center">
                                        <Box justifyContent="center" gap={5} sx={{ display: "flex", flexDirection: { base: "column", sm: "column", md: "row" }, width: { base: "100%", md: "90%", lg: "80%" } }}>
                                            <Tooltip hasArrow label="Please Connect to web3" bg={tooltipBg}>
                                                <Button flexGrow="1" minWidth={{ base: '100%', sm: 'auto' }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>
                                                    Deposit
                                                </Button>
                                            </Tooltip>
                                            <Tooltip hasArrow label="Please Connect to web3" bg={tooltipBg}>
                                                <Button flexGrow="1" minWidth={{ base: '100%', sm: 'auto' }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>
                                                    Withdraw
                                                </Button>
                                            </Tooltip>
                                            <Tooltip hasArrow label="" bg={tooltipBg}>
                                                <Button flexGrow="1" minWidth={{ base: '100%', sm: 'auto' }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>
                                                <NavLink to={"/web3off/fund/"+ item.address}>   Fund Page</NavLink>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip hasArrow label="Please Connect to web3" bg={tooltipBg}>
                                                <Button flexGrow="1" minWidth={{ base: '100%', sm: 'auto' }} bg={allbtnBg} color="#fff" sx={{ _hover: { backgroundColor: "#027CB8" } }}>
                                                    My Funds
                                                </Button>
                                            </Tooltip>
                                            <EtherscanButton address={item.address} />
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
                        }
                        {
                            !props.MobXStorage.FilterActive ? (
                                <PagePagination currentPage={currentPage} setCurrentPage={setCurrentPage} MobXStorage={props.MobXStorage} />
                            ) : (
                                null
                            )
                        }
                    </Box>
                
    )
}

// export default AllFundWithoutWeb3;
export default inject('MobXStorage')(observer(AllFundWithoutWeb3));

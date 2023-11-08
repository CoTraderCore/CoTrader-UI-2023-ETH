import React from 'react';
import getWeb3 from '../utils/getWeb3'
import { Button, Text, Box, } from '@chakra-ui/react';
import { BiBadgeCheck } from 'react-icons/bi'
import { inject, observer } from 'mobx-react';

const connectWallet = async (mobx) => {
  await getWeb3().then(async (response) => {
    const _web3 = response
    const _netId = Number(await response.eth.net.getId())
    const _accounts = await response.eth.getAccounts()
    mobx.initWeb3AndAccounts(_web3, _accounts, _netId)
  });
}

function Wallet(props) {
  return (
    <React.Fragment>
      {props.MobXStorage.web3 ? (
        <Box gap={2} display="flex" justifyContent="center" alignItems="center">
          <Button
            display="flex"
            gap={1}
            size={["xs", 'sm', "sm"]}
            fontSize={["xs", "sm"]}
            px={[2, 3]}
            py={[2, 3]}
            bg={props.btnbg}
            _hover={{ background: "gray.200" }}
            sx={{ color: "#34e391" }}
          >
            <BiBadgeCheck size={20} /> <Text>Connected</Text>
          </Button>
        </Box>
      )
        :
        (
          <Box>
            <Button
              size={["xs", 'sm', "sm"]}
              fontSize={["xs", "sm"]}
              px={[2, 3]}
              py={[2, 3]}
              bg={props.btnbg}
              _hover={{ background: "gray" }}
              onClick={() => connectWallet(props.MobXStorage)}
            >
              Connect wallet
            </Button>
          </Box>
        )
      }
    </React.Fragment>
  );
}

export default inject('MobXStorage')(observer(Wallet));


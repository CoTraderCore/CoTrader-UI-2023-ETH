import React from 'react'

import {
  SmartFundABIV7,
  // ExchangePortalAddressLight,
  ExchangePortalAddressV7
} from '../../config.js'

import { Alert, Box, Button } from '@chakra-ui/react'

// provide to fund latest version of trade portal
async function updateTradePortal(web3, accounts, smartFundAddress, closeModal) {
  console.log(smartFundAddress, ExchangePortalAddressV7, accounts[0])
  const smartFund = new web3.eth.Contract(SmartFundABIV7, smartFundAddress)
  await smartFund.methods.setNewExchangePortal(
    ExchangePortalAddressV7
  ).send({ from: accounts[0] })
  closeModal()
}

function MigrateToNewPortal(props) {
  return (
    <>
      {
        String(props.exchangePortalAddress).toLowerCase() !== String(ExchangePortalAddressV7).toLowerCase()
          ?
          (
            <Box>

              <Alert status="warning">
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <strong>Your trade portal version is deprecated, please update for get best options</strong>
                  <hr />
                  <Button
                    my={2}
                    colorScheme='red'
                    size="sm"
                    onClick={() => updateTradePortal(
                      props.web3,
                      props.accounts,
                      props.smartFundAddress,
                      props.closeModal
                    )
                    }
                  >
                    Update
                  </Button>
                  <hr />
                  <small style={{ color: "red" }}><strong>NOTE: If your update transaction was confirmed, but you still see this message, please reload the page</strong></small>
                </Box>
              </Alert>
            </Box>
          )
          :
          (
            null
          )
      }
    </>
  )
}

export default MigrateToNewPortal

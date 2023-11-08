// Set gas price in local storage

import React, { Component } from 'react'
import { Box, Button, ButtonGroup, Text } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
class SetGasPrice extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            gasPrice: 2000000000,
            gasPriceState: 'high'
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

    // get tokens addresses and symbols from paraswap api
    initData = async () => {
        // get gas price
        const gasPrice = BigNumber(await this.props.web3.eth.getGasPrice())
        if (this._isMounted) {
            this.setState({ gasPrice })
            localStorage.setItem('gasPrice', gasPrice.toString())
        }
    }

    // set gasPrice for trade
    setGasPrice = async (gasPriceState) => {
        const currentGasPrice = BigNumber(await this.props.web3.eth.getGasPrice())
        let gasPrice = BigNumber(2000000000)

        if (gasPriceState === "high")
            gasPrice = currentGasPrice

        if (gasPriceState === "average")
            // sub 25%
            gasPrice = currentGasPrice - (currentGasPrice / BigNumber(4)) < BigNumber(1000000000) // if average less than 1 gwei, set 2 gwei
                ?  BigNumber(2000000000)
                : Math.round(currentGasPrice - (currentGasPrice / BigNumber(4)))


        if (gasPriceState === "low")
            // sub 50%
            gasPrice = currentGasPrice / BigNumber(2) < BigNumber(1000000000) // if low less than 1 gwei, set 1 gwei
                ? BigNumber(1000000000)
                : Math.round(currentGasPrice / BigNumber(2))

        this.setState({ gasPrice, gasPriceState })
        localStorage.setItem('gasPrice', gasPrice.toString())
    }

    render() {
        return (
            <Box textAlign="center">
                <Text fontWeight="500" sx={{textDecoration:"underline",textTransform:"uppercase"}}>Select gas price</Text>
                <ButtonGroup mt={1} size="md">
                    <Button
                        colorScheme={this.state.gasPriceState === "high" ? "orange" : "green"}
                        variant="outline"
                        size="sm"
                        onClick={() => this.setGasPrice("high")}
                    >High</Button>

                    <Button
                        colorScheme={this.state.gasPriceState === "average" ? "orange" : "green"}
                        variant="outline"
                        size="sm"
                        onClick={() => this.setGasPrice("average")}
                    >Average</Button>

                    <Button
                        colorScheme={this.state.gasPriceState === "low" ? "orange" : "red"}
                        variant="outline"
                        size="sm"
                        onClick={() => this.setGasPrice("low")}
                    >Low</Button>
                </ButtonGroup>
                <Text mt={2} borderRadius={5} sx={{background:"gray",width:"100%",fontWeight:"500",fontsize:"10px"}}>Current {this.state.gasPrice / 1000000000} gwei</Text>
            </Box>
        )
    }

}

export default SetGasPrice

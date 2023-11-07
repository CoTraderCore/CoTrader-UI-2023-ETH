import React, { useState } from 'react';
import { observer, inject } from 'mobx-react';
import { fromWei } from 'web3-utils';
import {
    FormLabel,
    Input,
    Button,
    FormControl,
    Box,
    Select,
} from '@chakra-ui/react';

function FundFilter({ MobXStorage, onCloseModal }) {
    const initialState = {
        owner: '',
        name: '',
        valueInETH: '',
        valueInUSD: '',
        profitInETH: '',
        profitInUSD: '',
        mainAsset: '',
        address: '',
        timeCreation: 0,
    };

    const [filterOptions, setFilterOptions] = useState(
        MobXStorage.filterOptions || initialState
    );

    // filter smart funds by multi options
    // compare if strings match
    // compare if numbers are greater than or equal to
    function multiFilter() {
        // remove null, undefined, empty '', and 0 value
        let filteredOptions = removeEmptyValue(filterOptions);

        // get current funds
        let currentFunds = MobXStorage.SmartFundsOriginal;
        let filtered;
        let filterKeys = [];

        // don't apply filter if the user has not selected any filter options
        if (Object.keys(filteredOptions).length !== 0) {
            // apply multiple filters
            for (let key in filteredOptions) {
                // push filter keys
                filterKeys.push(key);
                // filter by time creation
                if (key === 'timeCreation') {
                    filtered = timeCreationFilter(currentFunds, filteredOptions[key]);
                }
                // filter by matching strings
                else if (typeof filteredOptions[key] === 'string') {
                    filtered = currentFunds.filter((item) =>
                        stringFilter(item, key, filteredOptions[key])
                    );
                }
                // filter by comparing numbers (>=)
                else if (typeof filteredOptions[key] === 'number') {
                    filtered = currentFunds.filter((item) =>
                        numberFilter(item, key, filteredOptions[key])
                    );
                } else {
                    console.log('Unknown filter type');
                }
                currentFunds = filtered;
            }
            // update MobxStorage
            MobXStorage.updateSmartFundsListByFilter(filtered, filterOptions, filterKeys);
        }

        onCloseModal();
    }

    // helpers
    const stringFilter = (item, key, value) => {
        if (item[key].toLowerCase().includes(value.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    };

    const numberFilter = (item, key, value) => {
        if (Number(fromWei(item[key])) >= value) {
            return true;
        } else {
            return false;
        }
    };

    const timeCreationFilter = (list, state) => {
        console.log(list[0].timeCreation);
        if (state === 'Newest') {
            return list.slice().sort(function (a, b) {
                return Number(b.timeCreation) - Number(a.timeCreation);
            });
        } else if (state === 'Oldest') {
            return list.slice().sort(function (a, b) {
                return Number(a.timeCreation) - Number(b.timeCreation);
            });
        } else {
            return list;
        }
    };

    // remove null, undefined, 0, and '' values from an object
    const removeEmptyValue = (obj) => {
        let newObj = {};
        Object.keys(obj).forEach((prop) => {
            if (obj[prop] && obj[prop] !== '' && obj[prop] !== 0) {
                newObj[prop] = obj[prop];
            }
        });
        return newObj;
    };

    const resetFilter = () => {
        MobXStorage.AllFunds();
        onCloseModal();
    };

    return (
                    <React.Fragment>
                        <FormControl>
                            <FormLabel>Fund name</FormLabel>
                            <Input
                                type="text"
                                value={filterOptions.name}
                                name="name"
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, name: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Manager address</FormLabel>
                            <Input
                                type="text"
                                value={filterOptions.owner}
                                name="owner"
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, owner: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Min value in ETH</FormLabel>
                            <Input
                                type="number"
                                name="valueInETH"
                                value={filterOptions.valueInETH}
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, valueInETH: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Min value in USD</FormLabel>
                            <Input
                                type="number"
                                name="valueInUSD"
                                value={filterOptions.valueInUSD}
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, valueInUSD: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Min profit in ETH</FormLabel>
                            <Input
                                type="number"
                                name="profitInETH"
                                value={filterOptions.profitInETH}
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, profitInETH: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Min profit in USD</FormLabel>
                            <Input
                                type="number"
                                name="profitInUSD"
                                value={filterOptions.profitInUSD}
                                onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, profitInUSD: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Fund type</FormLabel>
                            <Select
                                value={filterOptions.mainAsset}
                                onChange={(e) =>
                                    setFilterOptions({
                                        ...filterOptions,
                                        mainAsset: e.target.value === '' ? '' : e.target.value,
                                    })
                                }
                            >
                                <option>All</option>
                                <option>ETH</option>
                                <option>USD</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Time creation</FormLabel>
                            <Select
                                value={filterOptions.timeCreation}
                                onChange={(e) =>
                                    setFilterOptions({
                                        ...filterOptions,
                                        timeCreation: e.target.value === '' ? '' : e.target.value,
                                    })
                                }
                            >
                                <option>All</option>
                                <option>Newest</option>
                                <option>Oldest</option>
                            </Select>
                        </FormControl>

                        <br />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button colorScheme="teal" variant="outline" onClick={multiFilter}>
                                Apply filter
                            </Button>
                            <Button colorScheme="red" variant="outline" onClick={resetFilter}>
                                Reset filter
                            </Button>
                        </Box>
                    </React.Fragment>
    );
}

export default inject('MobXStorage')(observer(FundFilter));

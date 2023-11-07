import React, { useEffect, useState } from 'react';
import { Heading, Box, useColorModeValue } from '@chakra-ui/react';
import ApexChart from 'react-apexcharts';
import 'apexcharts/dist/apexcharts.css';
import Card from '../Card/Card';
import {inject, observer } from 'mobx-react';


const AssetsAlocationChart = ({ AssetsData, version }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        dataLabels: {
            enabled: false
        },
        colors: ["#00E396", "#984cf1", "#7500FF", "#FF4560", "#775DD0"],
        series: [],
    });

    const eth_token = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    useEffect(() => {
        updateAssetsData();
    }, [AssetsData]);

    const updateAssetsData = () => {
        const assetsData = AssetsData;

        if (assetsData) {
            const filterData = assetsData.filter((item) => parseFloat(item.assetValueInETHFromWei) > 0);

            const labels = filterData.map((item) => {
                return item.symbol;

            });

            const series = filterData.map((item) => parseFloat(item.assetValueInETHFromWei));

            // console.log(series);

            setChartData({
                labels,
                dataLabels: {
                    enabled: false,
                },
                colors: ["#00E396", "#984cf1", "#7500FF", "#00E396", "#FF4560", "#775DD0"],
                series,

            });
        }

    };

    const allbtnBg = useColorModeValue("#1A202C", "#fff")
    return (
        <React.Fragment>
            {
                chartData.labels && chartData.labels.length > 0 ? (
                    <Card>
                        <Box >
                            <Heading mb={5} fontSize="xl" fontWeight="700" color={allbtnBg} textTransform="capitalize">Asset allocation in ETH value</Heading>
                            <ApexChart
                                options={{
                                    labels: chartData.labels,
                                    dataLabels: {
                                        enabled: chartData.dataLabels.enabled,
                                    },
                                    legend: {
                                        show: true,
                                        position: 'bottom',
                                        labels: {
                                            colors: [allbtnBg, allbtnBg,allbtnBg,allbtnBg],
                                        },
                                    },
                                }}
                                series={chartData.series}
                                type="pie"
                                height="220px"
                            />
                        </Box>
                    </Card>
                ) : null
            }

        </React.Fragment>
    );
};

export default inject('MobXStorage')(observer(AssetsAlocationChart));

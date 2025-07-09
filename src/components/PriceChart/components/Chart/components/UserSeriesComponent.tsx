import { ChartContext } from 'constants/chart';
import { millisecondsToSeconds } from 'date-fns';
import { SpeedPositions } from 'enums/speedMarkets';
import { ISeriesApi } from 'lightweight-charts';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { timeToLocal } from 'utils/formatters/date';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { useAccount, useChainId, useClient } from 'wagmi';

export const UserPositionAreaSeries: React.FC<{
    asset: string;
    candlestickData: any;
}> = ({ asset, candlestickData }) => {
    const chart = useContext(ChartContext);
    const theme: ThemeInterface = useTheme();
    const [series, setSeries] = useState<ISeriesApi<'Area'> | undefined>();
    const networkId = useChainId();
    const client = useClient();
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector(getIsBiconomy);
    const [userData, setUserData] = useState<any>([]);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        (isBiconomy ? smartAccountConnector.biconomyAddress : walletAddress) as string,
        {
            enabled: isConnected,
            refetchInterval: 30 * 1000,
        }
    );

    useEffect(() => {
        if (userActiveSpeedMarketsDataQuery.isSuccess && candlestickData && candlestickData.length) {
            const result: Array<{
                time: number;
                value?: number;
                position: any;
                hide: boolean;
            }> = [];

            userActiveSpeedMarketsDataQuery.data
                .filter((position: any) => position.currencyKey === asset)
                .map((position) => {
                    const lastCandleTime = candlestickData[candlestickData.length - 1].time;
                    const deltaTime = candlestickData[1].time - candlestickData[0].time;
                    // if user position is in the future we need to draw every tick o the x axis using candle delta time
                    if (millisecondsToSeconds(Number(position.maturityDate)) > lastCandleTime) {
                        let iterator = 1;

                        while (
                            lastCandleTime + iterator * deltaTime <
                            millisecondsToSeconds(Number(position.maturityDate))
                        ) {
                            // we are adding every tick on the x axis but are hiding the data from being drawn by setting hide: true
                            result.push({
                                time: lastCandleTime + iterator * deltaTime,
                                value: position.strikePrice,
                                position,
                                hide: true,
                            });
                            iterator++;
                        }
                        // finally we can push the position that should be drawn and are passing hide:false to tell the chart to draw marker for this position
                        result.push({
                            time: millisecondsToSeconds(Number(position.maturityDate)),
                            value: position.strikePrice,
                            position,
                            hide: false,
                        });
                    } else {
                        // if user position is in the past we need to find the right candle where we should paint the position
                        // Checking if the position is present on the chart
                        if (millisecondsToSeconds(Number(position.maturityDate)) >= candlestickData[0].time) {
                            let it = 0;
                            while (
                                it <= candlestickData.length &&
                                candlestickData[it].time < millisecondsToSeconds(Number(position.maturityDate))
                            ) {
                                it++;
                            }
                            // checking if we found the position to be drawn
                            if (it < candlestickData.length)
                                result.push({
                                    time: candlestickData[it - 1].time,
                                    value: position.strikePrice,
                                    position,
                                    hide: false,
                                });
                        }
                    }
                });
            setUserData(result.sort((a, b) => a.time - b.time));
        } else {
            setUserData([]);
        }

        // eslint-disable-next-line
    }, [userActiveSpeedMarketsDataQuery.data, asset]);

    useEffect(() => {
        if (series) {
            chart?.removeSeries(series);
            setSeries(undefined);
        }

        const localSeries = chart?.addAreaSeries({
            crosshairMarkerVisible: false,
            lineVisible: false,
            priceLineVisible: false,
            pointMarkersVisible: false,
            topColor: 'transparent',
            bottomColor: 'transparent',
            lastValueVisible: false,
        });

        setSeries(localSeries);

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (series && userData.length > 0) {
            const userDataWithLocalTime = userData.map((data: any) => {
                return {
                    ...data,
                    time: timeToLocal(data.time),
                    shape: 'circle',
                };
            });
            const userDataWitoutDuplicates = userDataWithLocalTime.filter(
                (data: any, i: number) =>
                    i === userDataWithLocalTime.length - 1 || data.time !== userDataWithLocalTime[i + 1].time
            );
            series.setData(userDataWitoutDuplicates as any);

            const cleanArray = [];
            // merging multiple positions that have the same timestamp in one marker
            // checking if user has more than 1 active position
            if (userDataWithLocalTime.length > 1) {
                for (let index = 0; index < userDataWithLocalTime.length; index++) {
                    // checking if for loop has reach the last user position
                    if (index === userDataWithLocalTime.length - 1) {
                        // if the last user position does not have the same timestmap as previous one we push it to array as circle
                        if (userDataWithLocalTime[index - 1].time !== userDataWithLocalTime[index].time) {
                            cleanArray.push({
                                ...userDataWithLocalTime[index],
                                shape: 'circle',
                            });
                        } else {
                            // if the timestamp of last and prior to last positions match, then we push the last position as square
                            cleanArray.push({
                                ...userDataWithLocalTime[index],
                                shape: 'square',
                            });
                        }
                    } else if (userDataWithLocalTime[index].time === userDataWithLocalTime[index + 1].time) {
                        // here we check if the user position timestamp is equal to the next item in the array, if so we just proceed to the next one
                        continue;
                    } else {
                        // we reach the part where current position is different from the next one
                        // we need to check if the current position is the first one in the array
                        // if so we just push the position as there is no previous positions to check
                        if (index === 0) {
                            cleanArray.push({
                                ...userDataWithLocalTime[index],
                                shape: 'circle',
                            });
                        } else {
                            // here we need to check previous position timestamp as we know that the next one does not match the current
                            // if timestamp are different we can push position as circle
                            if (userDataWithLocalTime[index - 1].time !== userDataWithLocalTime[index].time) {
                                cleanArray.push({
                                    ...userDataWithLocalTime[index],
                                    shape: 'circle',
                                });
                            } else {
                                // otherwise we need to mark this one as multiple positions by drawing a square
                                cleanArray.push({
                                    ...userDataWithLocalTime[index],
                                    shape: 'square',
                                });
                            }
                        }
                    }
                }
            } else {
                cleanArray.push(...userDataWithLocalTime);
            }

            const markers = cleanArray
                .filter((value: any) => !value.hide)
                .map((value: any) => {
                    return {
                        time: value.time,
                        position: 'inBar',
                        size: 0.1,
                        color:
                            value.shape === 'square'
                                ? theme.chart.multiPositions
                                : value.position.side === SpeedPositions.UP
                                ? theme.chart.candleUp
                                : theme.chart.candleDown,
                        shape: value.shape,
                        text: value.shape === 'square' ? 'Multi positions' : value.position.side,
                    };
                });

            series?.setMarkers(markers as any);
        } else {
            series?.setMarkers([]);
            series?.setData([]);
        }
    }, [userData, series, theme]);

    return <></>;
};

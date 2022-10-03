/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AMMContainer,
    AMMContent,
    AmountToBuyContainer,
    AmountToBuyInput,
    CustomTooltip,
    Label,
    MaxButton,
} from './styled-components';

import useOvertimeVoucherQuery from 'queries/wallet/useOvertimeVoucherQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';

import { Position, Side } from 'constants/options';
import { AvailablePerSide, Balances, MarketData } from 'types/markets';
import { countDecimals, floorNumberToDecimals } from 'utils/formatters/number';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { COLLATERALS, MAX_USD_SLIPPAGE } from 'constants/markets';
import networkConnector from 'utils/networkConnector';
import { ethers } from 'ethers';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { getSportsAMMQuoteMethod } from 'utils/amm';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';

type AMMProps = {
    market: MarketData;
    selectedSide: Side;
    selectedPosition: Position;
    availablePerSide: AvailablePerSide;
};

const AMM: React.FC<AMMProps> = ({ market, selectedSide, selectedPosition, availablePerSide }) => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [tokenAmount, setTokenAmountValue] = useState<number | string>('');
    const [fieldChanging, setFieldChanging] = useState<string>('');
    const [maxUsdAmount, setMaxUsdAmount] = useState<number>(0);
    const [usdAmountValue, setUSDAmountValue] = useState<number | string>('');
    const [selectedStableIndex, setStableIndex] = useState<number>(0);
    const [tooltipTextUsdAmount, setTooltipTextUsdAmount] = useState<string>('');
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);

    const [isVoucherSelected, setIsVoucherSelected] = useState<boolean>(false);

    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const overtimeVoucherQuery = useOvertimeVoucherQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    console.log(tokenAmount);
    console.log(setBalances);
    console.log(setOpenApprovalModal);

    const overtimeVoucher = useMemo(() => {
        if (overtimeVoucherQuery.isSuccess && overtimeVoucherQuery.data) {
            setIsVoucherSelected(true);
            return overtimeVoucherQuery.data;
        }
        setIsVoucherSelected(false);
        return undefined;
    }, [overtimeVoucherQuery.isSuccess, overtimeVoucherQuery.data]);

    const paymentTokenBalance = useMemo(() => {
        if (overtimeVoucher && isVoucherSelected) {
            return Number(overtimeVoucher.remainingAmount.toFixed(2));
        }
        if (multipleStableBalances.data && multipleStableBalances.isSuccess) {
            return Number(multipleStableBalances.data[COLLATERALS[selectedStableIndex]].toFixed(2));
        }
        return 0;
    }, [
        multipleStableBalances.data,
        multipleStableBalances.isSuccess,
        selectedStableIndex,
        overtimeVoucher,
        isVoucherSelected,
    ]);

    useEffect(() => {
        setStableIndex(0);
    }, [selectedSide]);

    const setTooltipTextMessageUsdAmount = (value: string | number) => {
        if (Number(value) > paymentTokenBalance) {
            setTooltipTextUsdAmount(t('market.tooltip.no-funds'));
        } else {
            setTooltipTextUsdAmount('');
        }
    };

    const fetchAmmQuote = useCallback(
        async (amountForQuote: number) => {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const parsedAmount = ethers.utils.parseEther(amountForQuote.toString());
                const ammQuote = await getSportsAMMQuoteMethod(
                    selectedSide == Side.BUY,
                    selectedStableIndex,
                    networkId,
                    sportsAMMContractWithSigner,
                    market.address,
                    selectedPosition,
                    parsedAmount
                );

                if (selectedStableIndex !== 0) {
                    return ammQuote[0];
                }
                return ammQuote;
            }
        },
        [market.address, networkId, selectedPosition, selectedSide, selectedStableIndex]
    );

    const setUsdAmount = (value: string | number) => {
        setUSDAmountValue(value);
        setTooltipTextMessageUsdAmount(value);
    };

    const onMaxUsdClick = async () => {
        setFieldChanging('usdAmount');
        setUsdAmount(maxUsdAmount);
    };

    useDebouncedEffect(() => {
        const fetchData = async () => {
            if (fieldChanging == 'positionsAmount') {
                return;
            }
            const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
            const { sportsAMMContract, signer } = networkConnector;
            if (signer && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const roundedMaxAmount = floorNumberToDecimals(
                    availablePerSide ? availablePerSide.positions[selectedPosition].available : 0
                );
                if (roundedMaxAmount) {
                    const [sUSDToSpendForMaxAmount, ammBalances] = await Promise.all([
                        fetchAmmQuote(roundedMaxAmount),
                        contract.balancesOf(sportsAMMContract?.address),
                    ]);
                    const ammBalanceForSelectedPosition = ammBalances[selectedPosition];

                    const X = fetchAmountOfTokensForXsUSDAmount(
                        Number(usdAmountValue),
                        Number((market.positions[selectedPosition] as any).sides[Side.BUY].odd / 1),
                        sUSDToSpendForMaxAmount / divider,
                        availablePerSide.positions[selectedPosition].available,
                        ammBalanceForSelectedPosition / divider
                    );

                    if (X > availablePerSide.positions[selectedPosition].available) {
                        setTokenAmountValue(0);
                        return;
                    }
                    const roundedAmount = floorNumberToDecimals(X);
                    const quote = await fetchAmmQuote(roundedAmount);

                    const usdAmountValueAsNumber = Number(usdAmountValue);
                    const parsedQuote = quote / divider;

                    const recalculatedTokenAmount = ((X * usdAmountValueAsNumber) / parsedQuote).toFixed(2);
                    setTokenAmountValue(recalculatedTokenAmount);
                }
            }
        };

        fetchData().catch((e) => console.log(e));
    }, [usdAmountValue, selectedStableIndex]);

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            setIsFetching(true);
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                    contract.connect(signer);
                    const roundedMaxAmount = floorNumberToDecimals(
                        availablePerSide ? availablePerSide.positions[selectedPosition].available : 0
                    );
                    const divider = selectedStableIndex == 0 || selectedStableIndex == 1 ? 1e18 : 1e6;
                    const sUSDToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);
                    const formattedsUSDToSpendForMaxAmount = sUSDToSpendForMaxAmount / divider;

                    if (Number(paymentTokenBalance) > formattedsUSDToSpendForMaxAmount) {
                        if (formattedsUSDToSpendForMaxAmount <= Number(paymentTokenBalance) * MAX_USD_SLIPPAGE) {
                            setMaxUsdAmount(floorNumberToDecimals(formattedsUSDToSpendForMaxAmount));
                        } else {
                            const calculatedMaxAmount =
                                formattedsUSDToSpendForMaxAmount -
                                (formattedsUSDToSpendForMaxAmount - Number(paymentTokenBalance) * MAX_USD_SLIPPAGE);
                            setMaxUsdAmount(floorNumberToDecimals(calculatedMaxAmount));
                        }
                        setIsFetching(false);
                        return;
                    }
                    setMaxUsdAmount(floorNumberToDecimals(paymentTokenBalance * MAX_USD_SLIPPAGE));
                }
                setIsFetching(false);
            }
            setIsFetching(false);
            return;
        };
        getMaxUsdAmount();
    }, [
        selectedSide,
        usdAmountValue,
        balances,
        paymentTokenBalance,
        selectedStableIndex,
        market.address,
        selectedPosition,
        fetchAmmQuote,
        availablePerSide,
    ]);

    return (
        <AMMContainer>
            <AMMContent>
                <Label>{t('markets.market-details.usd-amount')}</Label>
                <CustomTooltip open={!!tooltipTextUsdAmount && !openApprovalModal} title={tooltipTextUsdAmount}>
                    <AmountToBuyContainer>
                        <AmountToBuyInput
                            name="usdAmount"
                            type="number"
                            value={usdAmountValue}
                            onChange={(e) => {
                                if (countDecimals(Number(e.target.value)) > 2) {
                                    return;
                                }
                                setFieldChanging(e.target.name);
                                setUsdAmount(e.target.value);
                            }}
                        />
                        <MaxButton disabled={isFetching} onClick={onMaxUsdClick}>
                            {t('markets.market-details.max')}
                        </MaxButton>
                    </AmountToBuyContainer>
                </CustomTooltip>
            </AMMContent>
        </AMMContainer>
    );
};

export default AMM;

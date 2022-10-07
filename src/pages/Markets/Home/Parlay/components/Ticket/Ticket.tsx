import { COLLATERALS_INDEX } from 'constants/currency';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { ParlaysMarket } from 'types/markets';
import { formatCurrency, roundNumberToDecimals } from 'utils/formatters/number';
import networkConnector from 'utils/networkConnector';
import { getParlayMarketsAMMQuoteMethod } from 'utils/parlayAmm';
import { RowSummary, SummaryLabel, SummaryValue } from '../../styled-components';

type TicketProps = {
    markets: ParlaysMarket[];
};

const Ticket: React.FC<TicketProps> = ({ markets }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [selectedStableIndex, setSelectedStableIndex] = useState<COLLATERALS_INDEX>(COLLATERALS_INDEX.sUSD);
    const [usdAmountValue, setUsdAmountValue] = useState<number | string>('');

    setSelectedStableIndex(COLLATERALS_INDEX.sUSD); // TODO: testing
    setUsdAmountValue(10); // TODO: testing

    const fetchParlayAmmQuote = useCallback(
        async (susdAmountForQuote: number) => {
            const { parlayMarketsAMMContract, signer } = networkConnector;
            if (parlayMarketsAMMContract && signer) {
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);
                const marketsAddresses = markets.map((market) => market.address);
                const selectedPositions = markets.map((market) => market.position);
                const susdPaid = ethers.utils.parseEther(roundNumberToDecimals(susdAmountForQuote).toString());
                const parlayAmmQuote = await getParlayMarketsAMMQuoteMethod(
                    true,
                    selectedStableIndex,
                    networkId,
                    parlayMarketsAMMContractWithSigner,
                    marketsAddresses,
                    selectedPositions,
                    susdPaid
                );

                return parlayAmmQuote;
            }
        },
        [networkId, selectedStableIndex, markets]
    );

    useEffect(() => {
        const getMaxUsdAmount = async () => {
            /*
            setIsFetching(true);
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const roundedMaxAmount = floorNumberToDecimals(availablePerSide.positions[market.position].available);
                const divider =
                    selectedStableIndex === COLLATERALS_INDEX.sUSD || selectedStableIndex == COLLATERALS_INDEX.DAI
                        ? 1e18
                        : 1e6;
                const susdToSpendForMaxAmount = await fetchAmmQuote(roundedMaxAmount);
                const decimalSusdToSpendForMaxAmount = susdToSpendForMaxAmount / divider;

                if (paymentTokenBalance > decimalSusdToSpendForMaxAmount) {
                    if (paymentTokenBalance * MAX_USD_SLIPPAGE >= decimalSusdToSpendForMaxAmount) {
                        setMaxUsdAmount(floorNumberToDecimals(decimalSusdToSpendForMaxAmount));
                    } else {
                        const calculatedMaxAmount = paymentTokenBalance * MAX_USD_SLIPPAGE;
                        setMaxUsdAmount(floorNumberToDecimals(calculatedMaxAmount));
                    }
                    setIsFetching(false);
                    return;
                }
                setMaxUsdAmount(floorNumberToDecimals(paymentTokenBalance * MAX_USD_SLIPPAGE));
            }
            setIsFetching(false);
            */

            const parlayAmmQuote = await fetchParlayAmmQuote(Number(usdAmountValue));
            console.log(parlayAmmQuote);
            return;
        };
        getMaxUsdAmount();
    }, [
        usdAmountValue,
        // balances,
        // paymentTokenBalance,
        // selectedStableIndex,
        // market.address,
        // market.position,
        // availablePerSide.positions,
        fetchParlayAmmQuote,
    ]);

    return (
        <>
            <RowSummary>
                <SummaryLabel>{t('markets.parlay.total-quote')}:</SummaryLabel>
                <SummaryValue>{formatCurrency(1)}</SummaryValue>
            </RowSummary>
        </>
    );
};

export default Ticket;

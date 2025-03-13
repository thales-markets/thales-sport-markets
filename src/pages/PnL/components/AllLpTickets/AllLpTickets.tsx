import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import SelectInput from 'components/SelectInput';
import { hoursToMilliseconds } from 'date-fns';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { Network } from 'enums/network';
import { League } from 'enums/sports';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { t } from 'i18next';
import { orderBy } from 'lodash';
import useLpTicketsQuery from 'queries/pnl/useLpTicketsQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { Coins } from 'thales-utils';
import { Rates } from 'types/collateral';
import { Ticket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import { useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const UNRESOLVED_PERIOD_IN_HOURS = 8;

type AllLpTicketsProps = {
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const AllLpTickets: React.FC<AllLpTicketsProps> = ({ round, leagueId, onlyPP }) => {
    const networkId = useChainId();
    const client = useClient();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector(getIsMobile);
    const [lp, setLp] = useState<number>(0);
    const [showOnlyOpenTickets, setShowOnlyOpenTickets] = useState<boolean>(false);
    const [showOnlyLiveTickets, setShowOnlyLiveTickets] = useState<boolean>(false);
    const [showOnlySgpTickets, setShowOnlySgpTickets] = useState<boolean>(false);
    const [showOnlyPendingTickets, setShowOnlyPendingTickets] = useState<boolean>(false);
    const [showOnlySystemBets, setShowOnlySystemBets] = useState<boolean>(false);
    const [showOnlyUnresolved, setShowOnlyUnresolved] = useState<boolean>(false);
    const [expandAll, setExpandAll] = useState<boolean>(false);
    const [minBuyInAmount, setMinBuyInAmount] = useState<number | string>('');
    const [minPayoutAmount, setMinPayoutAmount] = useState<number | string>('');

    const usdcLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.USDC, round, leagueId, onlyPP, {
        networkId,
        client,
    });
    const wethLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.WETH, round, leagueId, onlyPP, {
        networkId,
        client,
    });
    const thalesLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.THALES, round, leagueId, onlyPP, {
        networkId,
        client,
    });
    const cbbtcLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.cbBTC, round, leagueId, onlyPP, {
        networkId,
        client,
    });
    const wbtcLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.wBTC, round, leagueId, onlyPP, {
        networkId,
        client,
    });

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | undefined =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : undefined;

    const lpOptions = useMemo(() => {
        const lpOptions = [
            {
                value: 0,
                label: 'All LPs',
            },
            {
                value: 1,
                label: 'USDC',
            },
            {
                value: 2,
                label: 'WETH',
            },
        ];

        lpOptions.push({
            value: 3,
            label: networkId === Network.Base ? 'cbBTC' : 'THALES',
        });

        if (networkId === Network.Arbitrum) {
            lpOptions.push({
                value: 4,
                label: 'wBTC',
            });
        }

        return lpOptions;
    }, [networkId]);

    const lpTickets: Ticket[] = useMemo(() => {
        let lpTickets: Ticket[] = [];
        const defaultCollateral = getDefaultCollateral(networkId);
        const getValueInUsd = (collateral: Coins, value: number) => {
            if (defaultCollateral === collateral) {
                return value;
            }
            return (!!exchangeRates ? exchangeRates[collateral] || 1 : 1) * value;
        };

        if (
            usdcLpTicketsQuery.data &&
            usdcLpTicketsQuery.isSuccess &&
            wethLpTicketsQuery.data &&
            wethLpTicketsQuery.isSuccess &&
            thalesLpTicketsQuery.data &&
            thalesLpTicketsQuery.isSuccess &&
            cbbtcLpTicketsQuery.data &&
            cbbtcLpTicketsQuery.isSuccess &&
            wbtcLpTicketsQuery.data &&
            wbtcLpTicketsQuery.isSuccess
        ) {
            lpTickets = [
                ...(usdcLpTicketsQuery.data || []),
                ...(wethLpTicketsQuery.data || []),
                ...(thalesLpTicketsQuery.data || []),
                ...(cbbtcLpTicketsQuery.data || []),
                ...(wbtcLpTicketsQuery.data || []),
            ];
        }

        return orderBy(
            lpTickets.filter(
                (ticket) =>
                    ((ticket.isOpen && showOnlyOpenTickets) || !showOnlyOpenTickets) &&
                    ((lp !== 0 &&
                        ticket.collateral === lpOptions.find((lpOption: any) => lpOption.value === lp)?.label) ||
                        lp === 0) &&
                    ((ticket.isLive && showOnlyLiveTickets) || !showOnlyLiveTickets) &&
                    ((ticket.isSgp && showOnlySgpTickets) || !showOnlySgpTickets) &&
                    ((ticket.isOpen &&
                        ticket.sportMarkets.length === 1 &&
                        ticket.sportMarkets.some(
                            (market) => market.maturityDate < new Date() && !market.isResolved && !market.isCancelled
                        ) &&
                        showOnlyPendingTickets) ||
                        !showOnlyPendingTickets) &&
                    ((ticket.isSystemBet && showOnlySystemBets) || !showOnlySystemBets) &&
                    ((ticket.isOpen &&
                        ticket.sportMarkets.some(
                            (market) =>
                                market.apiMaturity &&
                                market.apiMaturity <
                                    new Date().getTime() - hoursToMilliseconds(UNRESOLVED_PERIOD_IN_HOURS) &&
                                !market.isResolved &&
                                !market.isCancelled
                        ) &&
                        showOnlyUnresolved) ||
                        !showOnlyUnresolved) &&
                    (getValueInUsd(ticket.collateral, ticket.buyInAmount) >= Number(minBuyInAmount) ||
                        !minBuyInAmount) &&
                    (getValueInUsd(ticket.collateral, ticket.payout) >= Number(minPayoutAmount) || !minPayoutAmount)
            ),
            ['timestamp'],
            ['desc']
        );
    }, [
        networkId,
        usdcLpTicketsQuery.data,
        usdcLpTicketsQuery.isSuccess,
        wethLpTicketsQuery.data,
        wethLpTicketsQuery.isSuccess,
        thalesLpTicketsQuery.data,
        thalesLpTicketsQuery.isSuccess,
        cbbtcLpTicketsQuery.data,
        cbbtcLpTicketsQuery.isSuccess,
        wbtcLpTicketsQuery.data,
        wbtcLpTicketsQuery.isSuccess,
        exchangeRates,
        showOnlyOpenTickets,
        lp,
        lpOptions,
        showOnlyLiveTickets,
        showOnlySgpTickets,
        showOnlyPendingTickets,
        showOnlySystemBets,
        showOnlyUnresolved,
        minBuyInAmount,
        minPayoutAmount,
    ]);

    return (
        <>
            <CheckboxContainer>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlyOpenTickets}
                        value={showOnlyOpenTickets.toString()}
                        onChange={(e: any) => setShowOnlyOpenTickets(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-open-tickets${isMobile ? '-short' : ''}`)}
                    />
                </CheckboxWrapper>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlyLiveTickets}
                        value={showOnlyLiveTickets.toString()}
                        onChange={(e: any) => setShowOnlyLiveTickets(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-live-tickets${isMobile ? '-short' : ''}`)}
                    />
                </CheckboxWrapper>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlyPendingTickets}
                        value={showOnlyPendingTickets.toString()}
                        onChange={(e: any) => setShowOnlyPendingTickets(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-pending-tickets${isMobile ? '-short' : ''}`)}
                    />
                </CheckboxWrapper>
            </CheckboxContainer>
            <CheckboxContainer>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlySystemBets}
                        value={showOnlySystemBets.toString()}
                        onChange={(e: any) => setShowOnlySystemBets(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-system-bets`)}
                    />
                </CheckboxWrapper>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlySgpTickets}
                        value={showOnlySgpTickets.toString()}
                        onChange={(e: any) => setShowOnlySgpTickets(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-sgp-tickets${isMobile ? '-short' : ''}`)}
                    />
                </CheckboxWrapper>
                <CheckboxWrapper>
                    <Checkbox
                        checked={showOnlyUnresolved}
                        value={showOnlyUnresolved.toString()}
                        onChange={(e: any) => setShowOnlyUnresolved(e.target.checked || false)}
                        label={t(`liquidity-pool.user-transactions.only-unresolved`, {
                            hours: UNRESOLVED_PERIOD_IN_HOURS,
                        })}
                    />
                </CheckboxWrapper>
            </CheckboxContainer>
            <InputContainer>
                <InputLabel>{t(`liquidity-pool.user-transactions.min-buy-in`)}:</InputLabel>
                <NumericInput
                    value={minBuyInAmount}
                    onChange={(e) => {
                        setMinBuyInAmount(e.target.value);
                    }}
                    inputFontWeight="600"
                    inputPadding="5px 10px"
                    borderColor={theme.input.borderColor.tertiary}
                    placeholder={t(`liquidity-pool.deposit-amount-placeholder`)}
                    width="200px"
                    containerWidth="200px"
                    margin="0 30px 0 0"
                />
                <InputLabel>{t(`liquidity-pool.user-transactions.min-payout`)}:</InputLabel>
                <NumericInput
                    value={minPayoutAmount}
                    onChange={(e) => {
                        setMinPayoutAmount(e.target.value);
                    }}
                    inputFontWeight="600"
                    inputPadding="5px 10px"
                    borderColor={theme.input.borderColor.tertiary}
                    placeholder={t(`liquidity-pool.deposit-amount-placeholder`)}
                    width="200px"
                    containerWidth="200px"
                />
            </InputContainer>
            <FlexDivSpaceBetween>
                <ExpandAllContainer onClick={() => setExpandAll(!expandAll)}>
                    {expandAll
                        ? t('liquidity-pool.user-transactions.colapse-all')
                        : t('liquidity-pool.user-transactions.expand-all')}
                    <ArrowIcon className={expandAll ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
                </ExpandAllContainer>
                <SelectContainer>
                    <SelectInput
                        options={lpOptions}
                        handleChange={(value) => setLp(Number(value))}
                        defaultValue={lp}
                        width={150}
                    />
                </SelectContainer>
            </FlexDivSpaceBetween>
            <TicketTransactionsTable
                ticketTransactions={lpTickets}
                isLoading={
                    usdcLpTicketsQuery.isLoading || wethLpTicketsQuery.isLoading || thalesLpTicketsQuery.isLoading
                }
                tableHeight="auto"
                ticketsPerPage={100}
                expandAll={expandAll}
            />
        </>
    );
};

const ExpandAllContainer = styled(FlexDivCentered)`
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    font-size: 18px;
`;

const SelectContainer = styled.div`
    margin: 0 0 15px 0;
    width: 150px;
`;

const CheckboxWrapper = styled.div`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-bottom: 5px;
    }
`;

const CheckboxContainer = styled(FlexDivSpaceBetween)`
    label {
        align-self: center;
        font-size: 18px;
        text-transform: none;
    }
    margin-bottom: 10px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 14px;
        flex-direction: column;
        align-items: start;
        justify-content: start;
        margin-bottom: 0;
    }
`;

const ArrowIcon = styled.i`
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-left: 10px;
`;

const InputContainer = styled(FlexDivStart)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

const InputLabel = styled.span`
    font-size: 18px;
    padding: 5px 10px 0 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 16px;
        padding: 5px 10px 5px 0;
    }
`;

export default AllLpTickets;

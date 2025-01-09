import Checkbox from 'components/fields/Checkbox';
import SelectInput from 'components/SelectInput';
import { hoursToMilliseconds } from 'date-fns';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { League } from 'enums/sports';
import { t } from 'i18next';
import { orderBy } from 'lodash';
import useLpTicketsQuery from 'queries/pnl/useLpTicketsQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivSpaceBetween } from 'styles/common';
import { Ticket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const UNRESOLVED_PERIOD_IN_HOURS = 6;

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
    {
        value: 3,
        label: 'THALES',
    },
];

type AllLpTicketsProps = {
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const AllLpTickets: React.FC<AllLpTicketsProps> = ({ round, leagueId, onlyPP }) => {
    const networkId = useChainId();
    const client = useClient();

    const isMobile = useSelector(getIsMobile);
    const [lp, setLp] = useState<number>(0);
    const [showOnlyOpenTickets, setShowOnlyOpenTickets] = useState<boolean>(false);
    const [showOnlyLiveTickets, setShowOnlyLiveTickets] = useState<boolean>(false);
    const [showOnlyPendingTickets, setShowOnlyPendingTickets] = useState<boolean>(false);
    const [showOnlySystemBets, setShowOnlySystemBets] = useState<boolean>(false);
    const [showOnlyUnresolved, setShowOnlyUnresolved] = useState<boolean>(false);
    const [expandAll, setExpandAll] = useState<boolean>(false);

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

    const lpTickets: Ticket[] = useMemo(() => {
        let lpTickets: Ticket[] = [];

        if (
            usdcLpTicketsQuery.data &&
            usdcLpTicketsQuery.isSuccess &&
            wethLpTicketsQuery.data &&
            wethLpTicketsQuery.isSuccess &&
            thalesLpTicketsQuery.data &&
            thalesLpTicketsQuery.isSuccess
        ) {
            lpTickets = [
                ...(usdcLpTicketsQuery.data || []),
                ...(wethLpTicketsQuery.data || []),
                ...(thalesLpTicketsQuery.data || []),
            ];
        }

        return orderBy(
            lpTickets.filter(
                (ticket) =>
                    ((ticket.isOpen && showOnlyOpenTickets) || !showOnlyOpenTickets) &&
                    ((lp !== 0 && ticket.collateral === lpOptions.find((lpOption) => lpOption.value === lp)?.label) ||
                        lp === 0) &&
                    ((ticket.isLive && showOnlyLiveTickets) || !showOnlyLiveTickets) &&
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
                                market.maturity <
                                    new Date().getTime() - hoursToMilliseconds(UNRESOLVED_PERIOD_IN_HOURS) &&
                                !market.isResolved &&
                                !market.isCancelled
                        ) &&
                        showOnlyUnresolved) ||
                        !showOnlyUnresolved)
            ),
            ['timestamp'],
            ['desc']
        );
    }, [
        lp,
        showOnlyLiveTickets,
        showOnlyOpenTickets,
        showOnlyPendingTickets,
        showOnlySystemBets,
        showOnlyUnresolved,
        thalesLpTicketsQuery.data,
        thalesLpTicketsQuery.isSuccess,
        usdcLpTicketsQuery.data,
        usdcLpTicketsQuery.isSuccess,
        wethLpTicketsQuery.data,
        wethLpTicketsQuery.isSuccess,
    ]);

    return (
        <>
            <CheckboxContainer>
                <Checkbox
                    checked={showOnlyOpenTickets}
                    value={showOnlyOpenTickets.toString()}
                    onChange={(e: any) => setShowOnlyOpenTickets(e.target.checked || false)}
                    label={t(`liquidity-pool.user-transactions.only-open-tickets${isMobile ? '-short' : ''}`)}
                />
                <Checkbox
                    checked={showOnlyLiveTickets}
                    value={showOnlyLiveTickets.toString()}
                    onChange={(e: any) => setShowOnlyLiveTickets(e.target.checked || false)}
                    label={t(`liquidity-pool.user-transactions.only-live-tickets${isMobile ? '-short' : ''}`)}
                />
                <Checkbox
                    checked={showOnlyPendingTickets}
                    value={showOnlyPendingTickets.toString()}
                    onChange={(e: any) => setShowOnlyPendingTickets(e.target.checked || false)}
                    label={t(`liquidity-pool.user-transactions.only-pending-tickets${isMobile ? '-short' : ''}`)}
                />
            </CheckboxContainer>
            <CheckboxContainer>
                <Checkbox
                    checked={showOnlySystemBets}
                    value={showOnlySystemBets.toString()}
                    onChange={(e: any) => setShowOnlySystemBets(e.target.checked || false)}
                    label={t(`liquidity-pool.user-transactions.only-system-bets`)}
                />
                <Checkbox
                    checked={showOnlyUnresolved}
                    value={showOnlyUnresolved.toString()}
                    onChange={(e: any) => setShowOnlyUnresolved(e.target.checked || false)}
                    label={t(`liquidity-pool.user-transactions.only-unresolved`, { hours: UNRESOLVED_PERIOD_IN_HOURS })}
                />
            </CheckboxContainer>
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

const CheckboxContainer = styled(FlexDivSpaceBetween)`
    label {
        align-self: center;
        font-size: 18px;
        text-transform: none;
    }
    @media (max-width: 575px) {
        font-size: 14px;
    }
    margin-bottom: 10px;
`;

const ArrowIcon = styled.i`
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-left: 10px;
`;

export default AllLpTickets;

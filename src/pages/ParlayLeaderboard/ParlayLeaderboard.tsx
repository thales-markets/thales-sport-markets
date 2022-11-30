import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { OddsType } from 'constants/markets';
import { t } from 'i18next';
import { AddressLink } from 'pages/Rewards/styled-components';

import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { ParlayMarketWithRank, PositionData, SportMarketInfo } from 'types/markets';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatDateWithTime } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    convertPositionToSymbolType,
    formatMarketOdds,
    getIsApexTopGame,
} from 'utils/markets';

const Rewards = [2000, 1500, 1000, 800, 750, 700, 600, 500, 300, 250, 225, 210, 200, 185, 170, 145, 130, 125, 110, 100];

const ParlayLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const query = useParlayLeaderboardQuery(networkId, undefined, undefined, { enabled: isAppReady });
    const parlays = query.isSuccess ? query.data : [];

    return (
        <Container>
            <Table
                data={parlays}
                tableRowHeadStyles={{ width: '100%' }}
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        accessor: 'rank',
                        Header: <>Rank</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['rank']>) => {
                            return cellProps.cell.value <= 20 ? (
                                <Tooltip
                                    overlay={<>{Rewards[cellProps.cell.value - 1]} OP</>}
                                    component={
                                        <FlexDivRowCentered style={{ position: 'relative', width: 14 }}>
                                            <StatusIcon
                                                style={{ fontSize: 16, position: 'absolute', left: '-20px' }}
                                                color="rgb(95, 97, 128)"
                                                className={`icon icon--fee-rebates`}
                                            />
                                            <TableText>{cellProps.cell.value}</TableText>
                                        </FlexDivRowCentered>
                                    }
                                ></Tooltip>
                            ) : (
                                <TableText>{cellProps.cell.value}</TableText>
                            );
                        },
                    },
                    {
                        Header: <>{t('rewards.table.wallet-address')}</>,
                        accessor: 'account',
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['account']>) => (
                            <AddressLink
                                href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 12 }}
                            >
                                {truncateAddress(cellProps.cell.value, 5)}
                            </AddressLink>
                        ),
                    },
                    {
                        accessor: 'totalQuote',
                        Header: <>Quote</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalQuote']>) => (
                            <TableText>{formatMarketOdds(OddsType.Decimal, cellProps.cell.value)}</TableText>
                        ),
                        sortable: true,
                        sortType: quoteSort(),
                    },
                    {
                        accessor: 'sUSDPaid',
                        Header: <>Paid</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['sUSDAfterFees']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                        sortable: true,
                    },
                    {
                        accessor: 'totalAmount',
                        Header: <>Won</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalAmount']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                        sortable: true,
                    },
                ]}
                noResultsMessage={t('profile.messages.no-transactions')}
                expandedRow={(row) => {
                    const toRender = row.original.sportMarketsFromContract.map((address: string, index: number) => {
                        const position = row.original.positions.find(
                            (position: any) => position.market.address == address
                        );

                        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');
                        return (
                            <ParlayRow style={{ opacity: getOpacity(position) }} key={index}>
                                <ParlayRowText>
                                    {getPositionStatus(position)}
                                    {position.market.homeTeam + ' vs ' + position.market.awayTeam}
                                </ParlayRowText>
                                <PositionSymbol
                                    type={convertPositionToSymbolType(
                                        positionEnum,
                                        getIsApexTopGame(position.market.isApex, position.market.betType)
                                    )}
                                    symbolColor={'white'}
                                    symbolSize={'10'}
                                    additionalText={{
                                        firstText: formatMarketOdds(
                                            OddsType.Decimal,
                                            row.original.marketQuotes ? row.original.marketQuotes[index] : 0
                                        ),
                                        firstTextStyle: {
                                            fontSize: '10.5px',
                                            color: 'white',
                                            marginLeft: '5px',
                                        },
                                    }}
                                    additionalStyle={{ width: 21, height: 21, fontSize: 10 }}
                                />
                                <QuoteText>{getParlayItemStatus(position.market)}</QuoteText>
                            </ParlayRow>
                        );
                    });

                    return (
                        <ExpandedRowWrapper>
                            <FirstSection>{toRender}</FirstSection>
                            <LastExpandedSection style={{ gap: 20 }}>
                                <QuoteWrapper>
                                    <QuoteLabel>Total Quote:</QuoteLabel>
                                    <QuoteText>{formatMarketOdds(OddsType.Decimal, row.original.totalQuote)}</QuoteText>
                                </QuoteWrapper>

                                <QuoteWrapper>
                                    <QuoteLabel>Total Amount:</QuoteLabel>
                                    <QuoteText>
                                        {formatCurrencyWithKey(USD_SIGN, row.original.totalAmount, 2)}
                                    </QuoteText>
                                </QuoteWrapper>
                            </LastExpandedSection>
                        </ExpandedRowWrapper>
                    );
                }}
            ></Table>
        </Container>
    );
};

const getPositionStatus = (position: PositionData) => {
    if (position.market.isResolved) {
        if (
            convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        ) {
            return <StatusIcon color="#5FC694" className={`icon icon--win`} />;
        } else {
            return <StatusIcon color="#E26A78" className={`icon icon--lost`} />;
        }
    } else {
        return <StatusIcon color="#FFFFFF" className={`icon icon--open`} />;
    }
};

const getOpacity = (position: PositionData) => {
    if (position.market.isResolved) {
        if (
            convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        ) {
            return 1;
        } else {
            return 0.5;
        }
    } else {
        return 1;
    }
};

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(Number(market.maturityDate) * 1000);
};

const Container = styled(FlexDivColumn)`
    position: relative;
    align-items: center;
    max-width: 800px;
    width: 100%;
`;

const TableText = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #eeeee4;
    @media (max-width: 600px) {
        font-size: 12px;
    }
`;

const quoteSort = () => (rowA: any, rowB: any) => {
    return rowA.original.totalQuote - rowB.original.totalQuote;
};

const StatusIcon = styled.i`
    font-size: 12px;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || 'white'};
    }
`;

const QuoteText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    display: flex;
`;

const QuoteLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;

    letter-spacing: 0.025em;
    text-transform: uppercase;
`;

const QuoteWrapper = styled.div`
    display: flex;
    flex: flex-start;
    align-items: center;
    gap: 6px;
    margin-left: 30px;
    @media (max-width: 600px) {
        margin-left: 0;
    }
`;

const TableHeaderStyle: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: '12px',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#5F6180',
    justifyContent: 'center',
};

const TableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};

const ExpandedRowWrapper = styled.div`
    display: flex;
    justify-content: space-evenly;
    padding-left: 60px;
    padding-right: 60px;
    border-bottom: 2px dotted rgb(95, 97, 128);
    @media (max-width: 600px) {
        flex-direction: column;
        padding-left: 10px;
        padding-right: 10px;
    }
    @media (max-width: 400px) {
        padding: 0;
    }
`;

const ParlayRow = styled(FlexDivRowCentered)`
    margin-top: 10px;
    justify-content: space-evenly;
    &:last-child {
        margin-bottom: 10px;
    }
`;

const ParlayRowText = styled(QuoteText)`
    max-width: 220px;
    width: 300px;
`;

const FirstSection = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
`;

const LastExpandedSection = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    @media (max-width: 600px) {
        flex-direction: row;
        margin: 10px 0;
    }
`;

export default ParlayLeaderboard;

import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { SportMarketInfo } from 'types/markets';
import { formatDateWithTime, formatTxTimestamp } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertPositionNameToPositionType,
    convertPositionToSymbolType,
    formatMarketOdds,
    getIsApexTopGame,
} from 'utils/markets';
import { getPositionColor } from 'utils/ui';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const ParlayTransactions: React.FC = () => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const parlaysTxQuery = useParlayMarketsQuery(walletAddress.toLowerCase(), networkId, undefined, undefined, {
        enabled: isWalletConnected,
        refetchInterval: false,
    });
    const parlayTx = parlaysTxQuery.isSuccess ? parlaysTxQuery.data : [];

    return (
        <>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        id: 'time',
                        Header: <>{'TIME'}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>;
                        },
                    },
                    {
                        id: 'id',
                        Header: <>{'Parlay ID'}</>,
                        accessor: 'id',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <FlexCenter>
                                    <TableText>{truncateAddress(cellProps.cell.value)}</TableText>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'position',
                        Header: <>{'Number of Games'}</>,
                        accessor: 'positions',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <FlexCenter>
                                    <TableText>{cellProps.cell.value.length}</TableText>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'paid',
                        Header: <>{'PAID'}</>,
                        accessor: 'sUSDAfterFees',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithKey('sUSD', cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{'AMOUNT'}</>,
                        accessor: 'totalAmount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                ]}
                initialState={{
                    sortBy: [
                        {
                            id: 'time',
                            desc: true,
                        },
                    ],
                }}
                isLoading={parlaysTxQuery?.isLoading}
                data={parlayTx ?? []}
                noResultsMessage={t('profile.messages.no-transactions')}
                expandedRow={(row) => {
                    const toRender = row.original.sportMarketsFromContract.map((address: string, index: number) => {
                        const position = row.original.positions.find(
                            (position: any) => position.market.address == address
                        );
                        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');
                        return (
                            <ParlayRow key={index}>
                                <ParlayRowText>
                                    {position.market.homeTeam + ' vs ' + position.market.awayTeam}
                                </ParlayRowText>
                                <PositionSymbol
                                    type={convertPositionToSymbolType(
                                        positionEnum,
                                        getIsApexTopGame(position.market.isApex, position.market.betType)
                                    )}
                                    symbolColor={getPositionColor(positionEnum)}
                                    symbolSize={'10'}
                                    additionalText={{
                                        firstText: formatMarketOdds(
                                            selectedOddsType,
                                            row.original.marketQuotes ? row.original.marketQuotes[index] : 0
                                        ),
                                        firstTextStyle: {
                                            fontSize: '10.5px',
                                            color: getPositionColor(positionEnum),
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
                            <FlexDivColumnCentered style={{ flex: 2 }}>{toRender}</FlexDivColumnCentered>
                            <LastExpandedSection style={{ flex: 1, gap: 20 }}>
                                <QuoteWrapper>
                                    <QuoteLabel>Total Quote:</QuoteLabel>
                                    <QuoteText>{formatMarketOdds(selectedOddsType, row.original.totalQuote)}</QuoteText>
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
        </>
    );
};

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(Number(market.maturityDate) * 1000);
};

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: left;
    @media (max-width: 600px) {
        font-size: 10px;
    }
    white-space: nowrap;
`;

const QuoteText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 10px;
    text-align: left;
    white-space: nowrap;
`;

const QuoteLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 10px;

    letter-spacing: 0.025em;
    text-transform: uppercase;

    color: #64d9fe;
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

const FlexCenter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ExpandedRowWrapper = styled.div`
    display: flex;
    padding-left: 30px;
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
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
`;

const ParlayRowText = styled(QuoteText)`
    max-width: 220px;
    width: 300px;
`;

const LastExpandedSection = styled(FlexDivColumnCentered)`
    @media (max-width: 600px) {
        flex-direction: row;
        margin: 10px 0;
    }
`;

export default ParlayTransactions;

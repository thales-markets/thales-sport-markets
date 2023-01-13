import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BackToLink from 'pages/Markets/components/BackToLink';
import SelectInput from 'components/SelectInput';

import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { truncateAddress } from 'utils/formatters/string';
import {
    AddressLink,
    BoldText,
    Container,
    Description,
    HighlightColumn,
    HighlightRow,
    Row,
    SelectContainer,
    TableContainer,
    Title,
    TotalPnl,
    TipLink,
    ColumnValue,
    MarketContainer,
} from './styled-components';
import useRewardsDataQuery from 'queries/rewards/useRewardsDataQuery';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import Search from 'components/Search';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatCurrency, formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';

type RewardsType = {
    address: string;
    rebates: number;
    percentage: number;
    volume: number;
    rewards: {
        op: number;
        thales: number;
    };
};

const TIP_96 =
    'https://thalesmarket.io/governance/thalesgov.eth/0xb8390244729d261029d9c5510dbd290c745a84693820e2ed229a6dc30ef6f4b8';

const Rewards: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector(getIsMobile);

    const [searchText, setSearchText] = useState<string>('');
    const PERIOD_DURATION_IN_DAYS = 14;
    const START_DATE = new Date(Date.UTC(2022, 8, 26, 0, 0, 0));
    const NOW = new Date();

    let CALCULATED_START = new Date(START_DATE.getTime());
    let PERIOD_COUNTER = 0;

    const options: Array<{ value: number; label: string }> = [];

    while (true) {
        if (CALCULATED_START.getTime() < NOW.getTime()) {
            CALCULATED_START = new Date(CALCULATED_START.getTime() + PERIOD_DURATION_IN_DAYS * 24 * 60 * 60 * 1000);
            options.push({
                value: PERIOD_COUNTER,
                label: t(`rewards.periods.period-${PERIOD_COUNTER}`),
            });
            PERIOD_COUNTER++;
        } else {
            break;
        }
    }

    const [period, setPeriod] = useState<number>(options.length > 0 ? options[options.length - 1].value : 0);

    const rewardsDataQuery = useRewardsDataQuery(networkId, period, {
        enabled: isAppReady,
    });

    const rewardsData = useMemo(() => {
        if (rewardsDataQuery?.isSuccess && rewardsDataQuery?.data?.users) {
            if (searchText !== '') {
                const data = rewardsDataQuery?.data?.users?.filter((user: any) =>
                    user?.address?.toLowerCase().includes(searchText?.toLowerCase())
                );

                return data;
            }
            return rewardsDataQuery?.data?.users;
        }

        return [];
    }, [rewardsDataQuery?.data?.users, rewardsDataQuery?.isSuccess, searchText]);

    const userRewardData = walletAddress
        ? rewardsData?.find((entry: any) =>
              entry?.address?.trim().toLowerCase()?.includes(walletAddress?.toLowerCase())
          )
        : null;

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Container>
                <MarketContainer>
                    <TableContainer>
                        <Title>{t('rewards.header')}</Title>
                        <Description>
                            <Trans
                                i18nKey="rewards.description"
                                components={{
                                    div: <div />,
                                    bold: <BoldText />,
                                    tipLink: <TipLink href={TIP_96} rel="noreferrer" target="_blank" />,
                                    parlayLink: (
                                        <TipLink
                                            href={buildHref(ROUTES.Leaderboard)}
                                            rel="noreferrer"
                                            target="_blank"
                                        />
                                    ),
                                }}
                            />
                            <Trans
                                i18nKey="rewards.parlay-link"
                                components={{
                                    div: <div />,
                                    parlayLink: (
                                        <TipLink
                                            href={buildHref(ROUTES.Leaderboard)}
                                            rel="noreferrer"
                                            target="_blank"
                                        />
                                    ),
                                }}
                            />
                        </Description>
                        <Search
                            text={searchText}
                            customPlaceholder={t('rewards.search-placeholder')}
                            handleChange={(e) => setSearchText(e)}
                            width={300}
                        />
                        <Row>
                            <SelectContainer>
                                <SelectInput
                                    options={options}
                                    handleChange={(value) => setPeriod(Number(value))}
                                    defaultValue={period}
                                    width={300}
                                />
                            </SelectContainer>
                            <TotalPnl>{`${t('rewards.twap')} is ${formatCurrencyWithSign(
                                USD_SIGN,
                                Math.abs(Number(rewardsDataQuery?.data?.twapForPeriod)),
                                2
                            )}`}</TotalPnl>
                            <TotalPnl>{`${t('rewards.total-global-rebates')} is ${formatCurrencyWithSign(
                                USD_SIGN,
                                Math.abs(Number(rewardsDataQuery?.data?.rebatesToPay)),
                                2
                            )}`}</TotalPnl>
                        </Row>
                        {userRewardData && (
                            <HighlightRow>
                                <HighlightColumn>{t('rewards.your-score')}</HighlightColumn>
                                <HighlightColumn>
                                    {formatCurrencyWithSign(USD_SIGN, userRewardData?.volume, 2)}
                                </HighlightColumn>
                                <HighlightColumn>
                                    {formatCurrencyWithSign(USD_SIGN, userRewardData?.rebates, 2)}
                                </HighlightColumn>
                                <HighlightColumn>{`${Number(userRewardData?.percentage).toFixed(
                                    2
                                )} %`}</HighlightColumn>
                                <HighlightColumn>{`${formatCurrency(userRewardData?.rewards?.op)} OP + ${formatCurrency(
                                    userRewardData?.rewards?.thales
                                )} THALES`}</HighlightColumn>
                            </HighlightRow>
                        )}
                        <Table
                            columns={[
                                {
                                    Header: <>{t('rewards.table.wallet-address')}</>,
                                    accessor: 'address',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['address']>) => (
                                        <AddressLink
                                            href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {truncateAddress(cellProps.cell.value, isMobile ? 3 : 5)}
                                        </AddressLink>
                                    ),
                                    sortable: false,
                                },
                                {
                                    Header: <>{t('rewards.table.volume')}</>,
                                    accessor: 'volume',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['volume']>) => (
                                        <ColumnValue>
                                            {isMobile
                                                ? formatCurrencyWithSign(USD_SIGN, Number(cellProps.cell.value), 0)
                                                : formatCurrencyWithSign(USD_SIGN, Number(cellProps.cell.value))}
                                        </ColumnValue>
                                    ),
                                    sortType: volumeSort(),
                                    sortable: true,
                                    headStyle: {
                                        mediaMaxWidth: '600px',
                                        cssProperties: { textAlign: 'right' },
                                    },
                                    headTitleStyle: { mediaMaxWidth: '600px', cssProperties: { width: '100%' } },
                                },
                                {
                                    Header: <>{t('rewards.table.rebates')}</>,
                                    accessor: 'rebates',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['rebates']>) => (
                                        <ColumnValue>
                                            {formatCurrencyWithSign(USD_SIGN, Number(cellProps.cell.value))}
                                        </ColumnValue>
                                    ),
                                    sortType: volumeSort(),
                                    sortable: true,
                                    headStyle: {
                                        mediaMaxWidth: '600px',
                                        cssProperties: { textAlign: 'right' },
                                    },
                                    headTitleStyle: { mediaMaxWidth: '600px', cssProperties: { width: '100%' } },
                                },
                                {
                                    Header: (
                                        <>{isMobile ? t('rewards.table.percent') : t('rewards.table.percentage')}</>
                                    ),
                                    accessor: 'percentage',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['percentage']>) => (
                                        <ColumnValue padding={'0 5px 0 0'}>
                                            {`${Number(cellProps.cell.value).toFixed(2)} %`}
                                        </ColumnValue>
                                    ),
                                    sortType: percentageSort(),
                                    sortable: true,
                                    headStyle: {
                                        mediaMaxWidth: '600px',
                                        cssProperties: { textAlign: 'right' },
                                    },
                                    headTitleStyle: { mediaMaxWidth: '600px', cssProperties: { width: '100%' } },
                                },
                                {
                                    Header: <>{t('rewards.table.reward-amount')}</>,
                                    accessor: 'rewards',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['rewards']>) => (
                                        <ColumnValue padding={'5px 0'}>{`${formatCurrency(
                                            cellProps.cell.value?.op
                                        )} OP + ${formatCurrency(cellProps.cell.value?.thales)} THALES`}</ColumnValue>
                                    ),
                                    sortType: rewardsSort(),
                                    sortable: true,
                                    headStyle: {
                                        mediaMaxWidth: '600px',
                                        cssProperties: { textAlign: 'right' },
                                    },
                                    headTitleStyle: { mediaMaxWidth: '600px', cssProperties: { width: '100%' } },
                                },
                            ]}
                            initialState={{
                                sortBy: [
                                    {
                                        id: 'rewards',
                                        desc: true,
                                    },
                                ],
                            }}
                            data={rewardsData}
                            isLoading={rewardsDataQuery?.isLoading}
                            noResultsMessage={t('rewards.table.no-data-available')}
                        />
                    </TableContainer>
                </MarketContainer>
            </Container>
        </>
    );
};

const rewardsSort = () => (rowA: any, rowB: any) => {
    return rowA.original.rewards.op - rowB.original.rewards.op;
};

const percentageSort = () => (rowA: any, rowB: any) => {
    return rowA.original.percentage - rowB.original.percentage;
};

const volumeSort = () => (rowA: any, rowB: any) => {
    return rowA.original.volume - rowB.original.volume;
};

export default Rewards;

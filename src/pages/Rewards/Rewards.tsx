import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BackToLink from 'pages/Markets/components/BackToLink';
import SelectInput from 'components/SelectInput';

import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { truncateAddress } from 'utils/formatters/string';
import { MarketContainer } from 'pages/Markets/Market/MarketDetails/styled-components/MarketDetails';
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
} from './styled-components';
import useRewardsDataQuery from 'queries/rewards/useRewardsDataQuery';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady } from 'redux/modules/app';
import Search from 'components/Search';
import { getEtherscanAddressLink } from 'utils/etherscan';

type RewardsType = {
    address: string;
    pnl: number;
    percentage: number;
    rewards: {
        op: number;
        thales: number;
    };
};

const Rewards: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [searchText, setSearchText] = useState<string>('');
    const PERIOD_DURATION_IN_DAYS = 14;
    const START_DATE = new Date(Date.UTC(2022, 7, 29, 0, 0, 0));
    const NOW = new Date();

    let CALCULATED_START = new Date(START_DATE.getTime());
    let PERIOD_COUNTER = 0;

    const options: Array<{ value: number; label: string }> = [];

    while (true) {
        if (CALCULATED_START.getTime() < NOW.getTime() && PERIOD_COUNTER < 2) {
            CALCULATED_START = new Date(CALCULATED_START.getTime() + PERIOD_DURATION_IN_DAYS * 24 * 60 * 60 * 1000);
            options.push({
                value: PERIOD_COUNTER,
                label: mapPeriod(PERIOD_COUNTER as any, t),
            });
            PERIOD_COUNTER++;
        } else {
            break;
        }
    }
    const [period, setPeriod] = useState<number>(options.length > 0 ? options[options.length - 1].value : 0);

    const rewardsDataQuery = useRewardsDataQuery(networkId, period + 2, {
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
                                i18nKey={t('rewards.description')}
                                components={[
                                    <div key="0">
                                        <BoldText />
                                    </div>,
                                    <p key="1">
                                        <BoldText />
                                    </p>,
                                ]}
                            />
                        </Description>
                        <Search
                            text={searchText}
                            customPlaceholder={t('rewards.search-placeholder')}
                            handleChange={(e) => setSearchText(e)}
                            customStyle={{ border: '1px solid #1A1C2B' }}
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
                            <TotalPnl>{`${t('rewards.total-negative-pnl')} is ${Math.abs(
                                Number(rewardsDataQuery?.data?.negativePnlTotal)
                            ).toFixed(2)} $`}</TotalPnl>
                        </Row>
                        {userRewardData && (
                            <HighlightRow>
                                <HighlightColumn>{'Your score'}</HighlightColumn>
                                <HighlightColumn>{`${Number(userRewardData?.pnl).toFixed(2)} $`}</HighlightColumn>
                                <HighlightColumn>{`${Number(userRewardData?.percentage).toFixed(
                                    2
                                )} %`}</HighlightColumn>
                                <HighlightColumn>{`${Number(userRewardData?.rewards?.op).toFixed(2)} OP + ${Number(
                                    userRewardData?.rewards?.thales
                                ).toFixed(2)} THALES`}</HighlightColumn>
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
                                            {truncateAddress(cellProps.cell.value, 5)}
                                        </AddressLink>
                                    ),
                                    sortable: false,
                                },
                                {
                                    Header: <>{t('rewards.table.pnl')}</>,
                                    accessor: 'pnl',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['pnl']>) => (
                                        <p>{`${Number(cellProps.cell.value).toFixed(2)} $`}</p>
                                    ),
                                    sortType: pnlSort(),
                                    sortable: true,
                                },
                                {
                                    Header: <>{t('rewards.table.percentage')}</>,
                                    accessor: 'percentage',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['percentage']>) => (
                                        <p>{`${Number(cellProps.cell.value).toFixed(2)} %`}</p>
                                    ),
                                    sortType: percentageSort(),
                                    sortable: true,
                                },
                                {
                                    Header: <>{t('rewards.table.reward-amount')}</>,
                                    accessor: 'rewards',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['rewards']>) => (
                                        <p>{`${Number(cellProps.cell.value?.op).toFixed(2)} OP + ${Number(
                                            cellProps.cell.value?.thales
                                        ).toFixed(2)} THALES`}</p>
                                    ),
                                    sortType: rewardsSort(),
                                    sortable: true,
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

const pnlSort = () => (rowA: any, rowB: any) => {
    return rowA.original.pnl - rowB.original.pnl;
};

const mapPeriod = (period: number, t: any) => {
    switch (period) {
        case 0:
            return t('rewards.periods.first-period');
        case 1:
            return t('rewards.periods.second-period');
        case 2:
            return t('rewards.periods.third-period');
        case 3:
            return t('rewards.periods.fourth-period');
        case 4:
            return t('rewards.periods.fifth-period');
        default:
            return '';
    }
};

export default Rewards;

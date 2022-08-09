import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BackToLink from 'pages/Markets/components/BackToLink';
import SelectInput from 'components/SelectInput';

import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { truncateAddress } from 'utils/formatters/string';
import { MarketContainer } from 'pages/Markets/Market/MarketDetails/styled-components/MarketDetails';
import { Container, Description, Row, SelectContainer, TableContainer, Title, TotalPnl } from './styled-components';
import useRewardsDataQuery from 'queries/rewards/useRewardsDataQuery';
import { getNetworkId } from 'redux/modules/wallet';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady } from 'redux/modules/app';

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
    const [period, setPeriod] = useState<number>(0);

    const rewardsDataQuery = useRewardsDataQuery(networkId, period, {
        enabled: isAppReady,
    });

    const rewardsData = useMemo(() => {
        if (rewardsDataQuery?.isSuccess && rewardsDataQuery?.data?.users) {
            return rewardsDataQuery?.data?.users;
        }

        return [];
    }, [rewardsDataQuery?.data?.users, rewardsDataQuery?.isSuccess]);

    const options = [
        {
            value: 0,
            label: 'First period',
        },
        {
            value: 1,
            label: 'Second period',
        },
    ];

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Container>
                <MarketContainer>
                    <TableContainer>
                        <Title>{t('rewards.header')}</Title>
                        <Description>{t('rewards.description')}</Description>
                        <Row>
                            <SelectContainer>
                                <SelectInput
                                    options={options}
                                    handleChange={(value) => setPeriod(Number(value))}
                                    defaultValue={0}
                                    width={300}
                                />
                            </SelectContainer>
                            <TotalPnl>{`${t('rewards.total-negative-pnl')} is ${Number(
                                rewardsDataQuery?.data?.negativePnlTotal
                            ).toFixed(2)}`}</TotalPnl>
                        </Row>
                        <Table
                            columns={[
                                {
                                    Header: <>{t('rewards.table.wallet-address')}</>,
                                    accessor: 'address',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['address']>) => (
                                        <p>{truncateAddress(cellProps.cell.value, 5)}</p>
                                    ),
                                },
                                {
                                    Header: <>{t('rewards.table.pnl')}</>,
                                    accessor: 'pnl',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['pnl']>) => (
                                        <p>{Number(cellProps.cell.value).toFixed(2)}</p>
                                    ),
                                    sortable: true,
                                },
                                {
                                    Header: <>{t('rewards.table.percentage')}</>,
                                    accessor: 'percentage',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['percentage']>) => (
                                        <p>{`${Number(cellProps.cell.value).toFixed(2)} %`}</p>
                                    ),
                                    sortable: true,
                                },
                                {
                                    Header: <>{t('rewards.table.reward-amount')}</>,
                                    sortType: 'basic',
                                    accessor: 'rewards',
                                    Cell: (cellProps: CellProps<RewardsType, RewardsType['rewards']>) => (
                                        <p>{`${Number(cellProps.cell.value?.op).toFixed(2)} OP + ${Number(
                                            cellProps.cell.value?.thales
                                        ).toFixed(2)} THALES`}</p>
                                    ),
                                    sortable: true,
                                },
                            ]}
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

export default Rewards;

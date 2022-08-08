import React from 'react';
import { useTranslation } from 'react-i18next';

import BackToLink from 'pages/Markets/components/BackToLink';

import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { formatCurrency } from 'utils/formatters/number';
import { FlexDivColumn } from 'styles/common';
import styled from 'styled-components';

type RewardsType = {
    walletAddress: string;
    pnl: number | string;
    percentage: number | string;
    reward: number | string;
};

const Rewards: React.FC = () => {
    const { t } = useTranslation();
    const isLoading = false;
    const data = [
        {
            walletAddress: '0xfd4da3a9ce0dbc4f7fd57fdafc2aa5145f5be200',
            pnl: '51',
            percentage: '3.87',
            reward: '172.3',
        },
        {
            walletAddress: '0xb66b9730e0c39ea18de01e1723614e59cdd73fba',
            pnl: '36',
            percentage: '8.03',
            reward: '248.2',
        },
        // {
        //     walletAddress: '0x30914fcfd5d5fe733bf36bfeef06d9a223b39e64',
        //     pnl: 30,
        //     percentage: 1.04,
        //     reward: 381.5,
        // },
        // {
        //     walletAddress: '0xe4e6d1d32c8a07e7a571f05c910e469662cae4e2',
        //     pnl: 67,
        //     percentage: 1.73,
        //     reward: 446.5,
        // },
        // {
        //     walletAddress: '0x60840716feb3b577e54679e4cce23eeac18873c0',
        //     pnl: 86,
        //     percentage: 8.31,
        //     reward: 368.3,
        // },
        // {
        //     walletAddress: '0x818ea0e2d022443bd05af4ca1242fa5d340f4882',
        //     pnl: 94,
        //     percentage: 1.29,
        //     reward: 750.1,
        // },
        // {
        //     walletAddress: '0x501df5ee74a9de23b34eff91f65be5eae2f96592',
        //     pnl: 56,
        //     percentage: 7.18,
        //     reward: 21.2,
        // },
        // {
        //     walletAddress: '0x2b6e22b64c37f78ecb6697f56632aa72d8061dfa',
        //     pnl: 91,
        //     percentage: 5.92,
        //     reward: 400.5,
        // },
        // {
        //     walletAddress: '0x3562e7660581ba1a62a278da6a374cf6b01cc31b',
        //     pnl: 31,
        //     percentage: 7.9,
        //     reward: 668.9,
        // },
        // {
        //     walletAddress: '0x7e3a9cb7713c1a71dadcead5fa373e7a7a812976',
        //     pnl: 24,
        //     percentage: 8.67,
        //     reward: 460.9,
        // },
    ];

    console.log('Data ', data);

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <TableContainer>
                <Title>{t('rewards.header')}</Title>
                <Table
                    columns={[
                        {
                            Header: <>{t('rewards.table.wallet-address')}</>,
                            accessor: 'walletAddress',
                            Cell: (cellProps: CellProps<RewardsType, RewardsType['walletAddress']>) => (
                                <p>{cellProps.cell.value}</p>
                            ),
                        },
                        {
                            Header: <>{t('rewards.table.pnl')}</>,
                            accessor: 'pnl',
                            Cell: (cellProps: CellProps<RewardsType, RewardsType['pnl']>) => (
                                <p>{cellProps.cell.value}</p>
                            ),
                            sortable: true,
                        },
                        {
                            Header: <>{t('rewards.table.percentage')}</>,
                            accessor: 'percentage',
                            Cell: (cellProps: CellProps<RewardsType, RewardsType['percentage']>) => (
                                <p>{cellProps.cell.value}</p>
                            ),
                            sortable: true,
                        },
                        {
                            Header: <>{t('rewards.table.reward-amount')}</>,
                            sortType: 'basic',
                            accessor: 'reward',
                            Cell: (cellProps: CellProps<RewardsType, RewardsType['reward']>) => (
                                <p>$ {formatCurrency(cellProps.cell.value)}</p>
                            ),
                            sortable: true,
                        },
                    ]}
                    data={data}
                    isLoading={isLoading ? false : false}
                    noResultsMessage={t('rewards.table.no-data-available')}
                />
            </TableContainer>
        </>
    );
};

const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
`;

const TableContainer = styled(FlexDivColumn)`
    overflow: auto;
    ::-webkit-scrollbar {
        width: 5px;
    }
    ::-webkit-scrollbar-track {
        background: #04045a;
        border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 15px;
        background: #355dff;
    }
    ::-webkit-scrollbar-thumb:active {
        background: #44e1e2;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgb(67, 116, 255);
    }
`;

export default Rewards;

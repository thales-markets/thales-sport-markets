import axios from 'axios';
import Button from 'components/Button';
import Table from 'components/Table';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getInfoToastOptions, getSuccessToastOptions } from 'config/toast';
import { t } from 'i18next';
import { orderBy } from 'lodash';
import useGetIsWhitelistedQuery from 'queries/freeBets/useGetIsWhitelistedQuery';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnNative } from 'styles/common';
import { formatTxTimestamp, NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { getCollateralByAddress } from 'utils/collaterals';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { CopyIcon } from './FreeBets';

const columns = [
    {
        header: <>ID</>,
        accessorKey: 'id',
        cell: (cellProps: any) => {
            const id = cellProps.row.original.id;
            const claimed = !!cellProps.row.original.claimer;
            return (
                <p>
                    {cellProps.cell.getValue()}
                    {!claimed && (
                        <CopyIcon
                            onClick={() => {
                                const toastId = toast.loading(t('free-bet.admin.copying'), {
                                    autoClose: 1000,
                                });
                                navigator.clipboard.writeText(id);
                                toast.update(toastId, {
                                    ...getInfoToastOptions(t('free-bet.admin.copied') + ' ' + id),
                                    autoClose: 1000,
                                });
                            }}
                            className="icon icon--copy"
                        />
                    )}
                </p>
            );
        },
        size: 320,
        enableSorting: true,
    },
    {
        header: <>Date created</>,
        accessorKey: 'timestamp',
        cell: (cellProps: any) => <p>{formatTxTimestamp(cellProps.cell.getValue())}</p>,
        size: 200,
        enableSorting: true,
    },
    {
        header: <>Bet</>,
        accessorKey: 'betAmount',
        cell: (cellProps: any) => (
            <p>
                {cellProps.cell.getValue()}{' '}
                {getCollateralByAddress(cellProps.row.original.collateral, cellProps.row.original.network)}
            </p>
        ),
        size: 80,
        enableSorting: true,
    },
    {
        header: <>Network</>,
        accessorKey: 'network',
        cell: (cellProps: any) => (
            <>
                <p>{NetworkId[cellProps.cell.getValue() as SupportedNetwork]}</p>
            </>
        ),
        size: 150,
        enableSorting: true,
    },
    {
        header: <>Claimer</>,
        accessorKey: 'claimer',
        cell: (cellProps: any) => {
            const isSmartAccount = !!cellProps.row.original.EOA;
            return isSmartAccount ? (
                <FlexDivColumnNative gap={3}>
                    <p>EOA: {cellProps.row.original.EOA}</p>
                    <p>SA: {cellProps.cell.getValue()}</p>
                </FlexDivColumnNative>
            ) : (
                <p>{cellProps.cell.getValue()}</p>
            );
        },
        size: 400,
        enableSorting: true,
    },
    {
        header: <>Claimed</>,
        accessorKey: 'claimSuccess',
        cell: (cellProps: any) => {
            const value = cellProps.cell.getValue().toString();
            return <p className={value}>{value}</p>;
        },
        size: 80,
        enableSorting: true,
    },
    {
        header: <></>,
        accessorKey: 'id',
        cell: (cellProps: any) => {
            const id = cellProps.cell.getValue().toString();
            return (
                <CopyIcon
                    onClick={() => {
                        const toastId = toast.loading(t('free-bet.admin.copying'), {
                            autoClose: 1000,
                        });
                        navigator.clipboard.writeText(`https://overtimemarkets.xyz/markets?freeBet=${id}`);
                        toast.update(toastId, {
                            ...getInfoToastOptions(t('free-bet.admin.copied') + ' ' + id),
                            autoClose: 1000,
                        });
                    }}
                    className="icon icon--copy"
                />
            );
        },
        size: 20,
    },
];

const StatsTable: React.FC = () => {
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();

    const [tableData, setTableData] = useState<any[]>([]);

    const isWhitelistedQuery = useGetIsWhitelistedQuery(walletAddress, networkId);
    const isWhitelisted = isWhitelistedQuery.isSuccess && isWhitelistedQuery.data;

    const generateDisabled = !walletAddress || !isWhitelisted;

    const onGetAllBets = useCallback(async () => {
        const toastId = toast.loading(t('market.toast-message.transaction-pending'));
        const signature = await signMessageAsync({ message: 'Free bets' });

        if (walletAddress && signature) {
            try {
                const response = await axios.post(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/get-all-free-bets`,
                    {
                        signature,
                    }
                );
                if (typeof response.data !== 'string') {
                    toast.update(toastId, getSuccessToastOptions('Success'));
                    setTableData(orderBy(response.data, ['timestamp'], ['desc']));
                }
            } catch (e: any) {
                if (e?.response?.data) {
                    toast.update(toastId, getErrorToastOptions(e.response.data));
                } else {
                    toast.update(toastId, getErrorToastOptions('Unknown error'));
                }
                console.log(e);
            }
        }
    }, [signMessageAsync, walletAddress, networkId]);

    return (
        <Container>
            {!tableData.length && (
                <FlexDivCentered>
                    <Button disabled={generateDisabled} onClick={onGetAllBets}>
                        Get
                    </Button>
                </FlexDivCentered>
            )}
            {!!tableData.length && (
                <TableContainer>
                    <Table
                        columns={columns as any}
                        data={tableData}
                        tableRowHeadStyles={{ minHeight: '35px' }}
                        tableHeadCellStyles={{ fontSize: '14px' }}
                        tableRowStyles={{ minHeight: '35px' }}
                        tableRowCellStyles={{ fontSize: '13px' }}
                        showPagination={true}
                    />
                </TableContainer>
            )}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 100px;
    @media (max-width: 767px) {
        overflow-x: scroll;
        display: block;
        & > div > div > div {
            overflow-x: hidden;
            min-height: 20px;
        }
    }
`;

const TableContainer = styled.div`
    width: 90%;
    height: 100%;
    @media (max-width: 767px) {
        width: 1250px;
    }
`;

export default StatsTable;

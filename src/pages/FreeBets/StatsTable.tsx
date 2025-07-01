import axios from 'axios';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Table from 'components/Table';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getInfoToastOptions, getSuccessToastOptions } from 'config/toast';
import { t } from 'i18next';
import { orderBy } from 'lodash';
import useGetIsWhitelistedQuery from 'queries/freeBets/useGetIsWhitelistedQuery';
import { useCallback, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDivCentered, FlexDivColumnNative, FlexDivRow } from 'styles/common';
import { formatTxTimestamp, NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { getCollateralByAddress } from 'utils/collaterals';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { CopyIcon } from './FreeBets';

const StatsTable: React.FC = () => {
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();
    const theme = useTheme();

    const [tableData, setTableData] = useState<any[]>([]);
    const [qrCode, setQrCode] = useState<string>('');

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
                        {!claimed && (
                            <QRIcon
                                onClick={() => setQrCode(`https://overtimemarkets.xyz/markets?freeBet=${id}`)}
                                className="icon icon--qr-code"
                            />
                        )}
                    </p>
                );
            },
            size: 320,
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
            header: <>Date created</>,
            accessorKey: 'timestamp',
            cell: (cellProps: any) => <p>{formatTxTimestamp(cellProps.cell.getValue())}</p>,
            size: 200,
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
            {!!qrCode && (
                <Modal
                    customStyle={{
                        overlay: {
                            zIndex: 1000,
                        },
                    }}
                    containerStyle={{
                        background: theme.background.secondary,
                        border: 'none',
                    }}
                    hideHeader
                    title=""
                    onClose={() => setQrCode('')}
                >
                    <QRWrapper>
                        <FlexDivRow>{<CloseIcon onClick={() => setQrCode('')} />}</FlexDivRow>
                        <QRCode value={qrCode} style={{ padding: '20px', background: 'white', borderRadius: '20px' }} />
                    </QRWrapper>
                </Modal>
            )}
        </Container>
    );
};

const QRWrapper = styled.div`
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    @media (max-width: 767px) {
        padding-left: 20px;
        padding-right: 20px;
    }
`;

const Container = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 100px;
    @media (max-width: 767px) {
        overflow-x: auto;
        min-height: 200px;
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

const QRIcon = styled.i`
    font-weight: 100;
    margin-left: 5px;
    font-size: 24px;
    color: white;
    cursor: pointer;
`;

export default StatsTable;

import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import useLeaderboardByVolumeQuery, { LeaderboardByVolumeData } from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { formatCurrencyWithKey, getEtherscanAddressLink } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { truncateAddress } from 'utils/formatters/string';
import { useAccount, useChainId } from 'wagmi';
import {
    Arrow,
    Container,
    OverlayContainer,
    StickyRow,
    TableHeader,
    TableHeaderContainer,
    TableRowCell,
    WalletAddress,
} from './styled-components';

type TableByVolumeProps = {
    searchText: string;
    isMainHeight: boolean;
    setLength: (length: number) => void;
};

const TableByVolume: React.FC<TableByVolumeProps> = ({ searchText, isMainHeight, setLength }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector(getIsMobile);
    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const columns = useMemo(
        () => [
            {
                header: <>{''}</>,
                accessorKey: 'rank',
                size: isMobile ? 30 : 60,
            },
            {
                header: <>{t('march-madness.leaderboard.address')}</>,
                accessorKey: 'walletAddress',
                cell: (cellProps: any) => (
                    <WalletAddress>
                        {truncateAddress(cellProps.cell.getValue(), 5)}
                        <a
                            href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Arrow className={'icon icon--arrow-external'} />
                        </a>
                    </WalletAddress>
                ),
                size: isMobile ? 140 : 180,
            },
            {
                header: <>{t('march-madness.leaderboard.volume')}</>,
                accessorKey: 'volume',
                cell: (cellProps: any) => <>{formatCurrencyWithKey(USD_SIGN, cellProps.cell.getValue(), 2)}</>,
                size: isMobile ? 90 : 140,
            },
            {
                header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-rewards-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessorKey: 'estimatedRewards',
                cell: (cellProps: any) => (
                    <>{formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.ARB, cellProps.cell.getValue(), 2)}</>
                ),
                size: isMobile ? 100 : 140,
            },
        ],
        [networkId, t, isMobile]
    );

    const leaderboardQuery = useLeaderboardByVolumeQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        if (data) {
            let finalData: LeaderboardByVolumeData = [];

            finalData = data;

            if (searchText.trim() !== '') {
                finalData = data.filter((user) => user.walletAddress.toLowerCase().includes(searchText.toLowerCase()));
            }

            return finalData;
        }
        return [];
    }, [data, searchText]);

    const stickyRow = useMemo(() => {
        if (myScore?.length) {
            return (
                <StickyRow myScore={true}>
                    <TableRowCell width={`${columns[0].size || 150}px`}>{myScore[0].rank}</TableRowCell>
                    <TableRowCell width={`${columns[1].size || 150}px`}>
                        {t('march-madness.leaderboard.my-rewards').toUpperCase()}
                    </TableRowCell>
                    <TableRowCell width={`${columns[2].size || 150}px`}>
                        {formatCurrencyWithKey(USD_SIGN, myScore[0].volume, 2)}
                    </TableRowCell>
                    <TableRowCell width={`${columns[3].size || 150}px`}>
                        {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.ARB, myScore[0].estimatedRewards, 2)}
                    </TableRowCell>
                </StickyRow>
            );
        }
    }, [myScore, t, columns]);

    useEffect(() => {
        setLength(filteredData.length);
    }, [setLength, filteredData.length]);

    return (
        <Container>
            <TableHeaderContainer>
                <TableHeader>{t('march-madness.leaderboard.by-volume')}</TableHeader>
            </TableHeaderContainer>
            <Table
                data={filteredData}
                columns={columns as any}
                columnsDeps={[isMobile]}
                stickyRow={stickyRow}
                rowsPerPage={20}
                isLoading={leaderboardQuery.isLoading}
                noResultsMessage={t('march-madness.leaderboard.no-data')}
                showPagination
                tableHeight={isMainHeight ? 'unset' : filteredData.length ? '100%' : 'calc(100% - 114px)'}
                tableHeadTitleStyles={{ fontFamily: theme.fontFamily.primary, fontSize: '12px' }}
                tableRowHeadStyles={{
                    border: `2px solid ${theme.marchMadness.borderColor.secondary}`,
                    borderRadius: 'unset',
                    background: 'transparent',
                }}
                tableHeadCellStyles={{ justifyContent: isMobile ? 'center' : 'left' }}
                tableStyle={`border: 2px solid ${theme.marchMadness.borderColor.secondary};  border-top: 0px; ${
                    isMainHeight || !filteredData.length ? 'min-height: 450px;' : ''
                }`}
                tableBodyPadding="0px"
                tableRowStyles={{
                    borderBottom: `1px solid ${theme.borderColor.secondary}`,
                }}
                tableRowCellStyles={{
                    fontFamily: theme.fontFamily.primary,
                    padding: '10px 0px',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '150%',
                    letterSpacing: '0.21px',
                    justifyContent: isMobile ? 'center' : 'left',
                }}
                noResultsStyle={{
                    fontFamily: theme.fontFamily.primary,
                    fontSize: '25px',
                    lineHeight: '40px',
                    color: theme.marchMadness.textColor.senary,
                    textTransform: 'uppercase',
                    width: '150px',
                    textAlign: 'center',
                    height: 'unset',
                    padding: 0,
                }}
            />
        </Container>
    );
};

export default TableByVolume;

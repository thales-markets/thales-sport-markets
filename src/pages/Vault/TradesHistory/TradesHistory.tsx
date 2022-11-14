import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import { getIsAppReady } from 'redux/modules/app';
import TradesTable from '../TradesTable';
import useVaultTradesQuery from 'queries/vault/useVaultTradesQuery';
import { VaultTrades, VaultTrade } from 'types/vault';
import SelectInput from 'components/SelectInput';

type TradesHistoryProps = {
    vaultAddress: string;
    currentRound: number;
};

const TradesHistory: React.FC<TradesHistoryProps> = ({ vaultAddress, currentRound }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [vaultTrades, setVaultTrades] = useState<VaultTrades>([]);
    const [round, setRound] = useState<number>(currentRound > 0 ? currentRound - 1 : 0);

    const rounds: Array<{ value: number; label: string }> = [];
    for (let index = 0; index < currentRound; index++) {
        rounds.push({
            value: index,
            label: `${t('vault.trades-history.round-label')} ${index + 1}`,
        });
    }

    const vaultTradesQuery = useVaultTradesQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    useEffect(() => {
        if (vaultTradesQuery.isSuccess && vaultTradesQuery.data) {
            setVaultTrades(
                orderBy(
                    vaultTradesQuery.data.filter((trade: VaultTrade) => trade.round === round + 1),
                    ['timestamp', 'blockNumber'],
                    ['desc', 'desc']
                )
            );
        } else {
            setVaultTrades([]);
        }
    }, [vaultTradesQuery.isSuccess, vaultTradesQuery.data, round]);

    const noResults = vaultTrades.length === 0;

    return (
        <Container>
            <Header>
                <Title>{t(`vault.trades-history.title`)}</Title>
                {currentRound !== 0 && (
                    <SelectContainer>
                        <SelectInput
                            options={rounds}
                            handleChange={(value) => setRound(Number(value))}
                            defaultValue={round}
                            width={230}
                        />
                    </SelectContainer>
                )}
            </Header>
            <TableContainer>
                <TradesTable
                    transactions={vaultTrades}
                    isLoading={vaultTradesQuery.isLoading}
                    noResultsMessage={noResults ? <span>{t(`vault.trades-history.no-trades`)}</span> : undefined}
                />
            </TableContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 10px;
    position: relative;
    max-height: 370px;
    min-height: 370px;
    overflow-y: auto;
    width: 80%;
    padding: 10px;
    margin-top: 20px;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

const Header = styled(FlexDivRow)`
    margin: 10px 18px;
    align-items: center;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 20px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 767px) {
        margin-bottom: 10px;
    }
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
    @media (max-width: 767px) {
        width: 700px;
    }
`;

export const SelectContainer = styled.div`
    width: 230px;
`;

export default TradesHistory;

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { orderBy } from 'lodash';
import { getIsAppReady } from 'redux/modules/app';
import TradesTable from '../TradesTable';
import useVaultTradesQuery from 'queries/vault/useVaultTradesQuery';
import { VaultTrades } from 'types/vault';

const PnL: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [vaultTrades, setVaultTrades] = useState<VaultTrades>([]);

    const vaultTradesQuery = useVaultTradesQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (vaultTradesQuery.isSuccess && vaultTradesQuery.data) {
            setVaultTrades(orderBy(vaultTradesQuery.data, ['timestamp', 'blockNumber'], ['desc', 'desc']));
        } else {
            setVaultTrades([]);
        }
    }, [vaultTradesQuery.isSuccess, vaultTradesQuery.data]);

    const noResults = vaultTrades.length === 0;

    return (
        <Container>
            <Title>{t(`vault.trades-history.title`)}</Title>
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
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
    width: 100%;
    max-height: 500px;
    min-height: 300px;
    overflow-y: auto;
    width: 60%;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 100%;
    margin-top: 20px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
    text-align: center;
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

export default PnL;

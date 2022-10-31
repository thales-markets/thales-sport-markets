import useUsersStatsQuery from 'queries/wallet/useUsersStatsQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatCurrencyWithKey } from 'utils/formatters/number';

const UserStats: React.FC = () => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const userStatQuery = useUsersStatsQuery(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const user = userStatQuery.isSuccess ? userStatQuery.data[0] : { id: '', trades: 0, volume: 0, pnl: 0 };

    return (
        <Wrapper>
            <SectionWrapper>
                <Section>
                    <Label>Trades:</Label>
                    <Value>{user.trades}</Value>
                </Section>
                <Section>
                    <Label>P&L:</Label>
                    <Value>{formatCurrencyWithKey('USD', user.pnl, 2)}</Value>
                </Section>
            </SectionWrapper>
            <SectionWrapper>
                <Section>
                    <Label>Total Volume:</Label>
                    <Value>{formatCurrencyWithKey('USD', user.volume, 2)}</Value>
                </Section>
                <Section>
                    <Label>Total Volume:</Label>
                    <Value>{formatCurrencyWithKey('USD', user.volume, 2)}</Value>
                </Section>
            </SectionWrapper>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    background: #303656;
    border-radius: 5px;
    max-width: 500px;
    width: 100%;
    flex-wrap: wrap;
    flex-direction: column;
    padding: 8px 14px;
    gap: 4px;
`;

const SectionWrapper = styled.div`
    display: flex;
    gap: 30px;
`;

const Section = styled.div`
    display: flex;
    justify-content: space-between;
    flex: 1;
    align-items: center;
`;

const Label = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 10.585px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #64d9fe;
`;

const Value = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 10.585px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: white;
    text-align: right;
`;

export default UserStats;

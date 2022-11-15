import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { useTranslation } from 'react-i18next';
import { getIsAppReady } from 'redux/modules/app';
import { VaultPnls } from 'types/vault';
import useVaultPnlsQuery from 'queries/vault/useVaultPnlsQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Colors, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatPercentageWithSign } from 'utils/formatters/number';

type PnlProps = {
    vaultAddress: string;
    lifetimePnl: number;
};

const PnL: React.FC<PnlProps> = ({ vaultAddress, lifetimePnl }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [vaultPnls, setVaultPnls] = useState<VaultPnls>([]);

    const vaultPnlsQuery = useVaultPnlsQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    useEffect(() => {
        if (vaultPnlsQuery.isSuccess && vaultPnlsQuery.data) {
            setVaultPnls(vaultPnlsQuery.data);
        } else {
            setVaultPnls([]);
        }
    }, [vaultPnlsQuery.isSuccess, vaultPnlsQuery.data]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <TooltipContainer>
                    <TooltipAmount>{formatPercentageWithSign(payload[0].value)}</TooltipAmount>
                </TooltipContainer>
            );
        }
        return null;
    };

    const noData = vaultPnls.length === 0;

    return (
        <Container>
            <Header noData={noData}>
                <Title>{t(`vault.pnl.title`)}</Title>
                <LifetimePnlContainer>
                    <LifetimePnlLabel>{t('vault.pnl.lifetime-pnl')}:</LifetimePnlLabel>
                    <LifetimePnl color={lifetimePnl === 0 ? Colors.WHITE : lifetimePnl > 0 ? Colors.GREEN : Colors.RED}>
                        {formatPercentageWithSign(lifetimePnl)}
                    </LifetimePnl>
                </LifetimePnlContainer>
            </Header>
            {!noData ? (
                <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vaultPnls}>
                            <CartesianGrid strokeDasharray="2 2" strokeWidth={0.5} stroke="#5F6180" />
                            <XAxis
                                dataKey="round"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#5F6180' }}
                                style={{
                                    fontSize: '15px',
                                }}
                            />
                            <YAxis
                                tickFormatter={(val: any) => {
                                    return formatPercentageWithSign(val, val < 0.1 && val > -0.1 ? 2 : 0);
                                }}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#5F6180' }}
                                style={{
                                    fontSize: '15px',
                                }}
                                width={55}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#5F6180', fillOpacity: '0.3' }}
                                wrapperStyle={{ outline: 'none' }}
                            />
                            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                {vaultPnls.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? Colors.GREEN : Colors.RED} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <NoData>{t(`vault.pnl.no-data`)}</NoData>
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 80%;
    @media (max-width: 1440px) {
        width: 95%;
    }
`;

const ChartContainer = styled.div`
    height: 250px;
    width: 100%;
`;

const TooltipContainer = styled(FlexDivColumnCentered)`
    border-radius: 3px;
    z-index: 999;
    padding: 2px 12px;
    background: #f6f6fe;
    color: #303656;
`;

const TooltipAmount = styled(FlexDivColumn)`
    font-weight: bold;
    font-size: 15px;
    text-align: center;
`;

const Header = styled(FlexDivRow)<{ noData?: boolean }>`
    margin: ${(props) => (props.noData ? '20px 0px 6px 0px' : '20px 6px 6px 55px')};
`;

const Title = styled.span`
    color: #5f6180;
`;

const LifetimePnlContainer = styled(FlexDivRow)`
    align-items: center;
`;

const LifetimePnlLabel = styled.p``;

const LifetimePnl = styled.p<{ color: string }>`
    font-weight: 600;
    margin-left: 6px;
    color: ${(props) => props.color};
`;

const NoData = styled(FlexDivCentered)`
    border: 2px dotted #5f6180;
    margin-bottom: 10px;
    height: 200px;
    color: #5f6180;
`;

export default PnL;

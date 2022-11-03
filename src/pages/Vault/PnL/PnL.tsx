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
import { Colors, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { formatPercentageWithSign } from 'utils/formatters/number';

const PnL: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [vaultPnls, setVaultPnls] = useState<VaultPnls>([]);

    const vaultPnlsQuery = useVaultPnlsQuery(networkId, {
        enabled: isAppReady,
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

    return (
        <Container>
            <Title>{t(`vault.pnl.title`)}</Title>
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
                                return formatPercentageWithSign(val, 0);
                            }}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#5F6180' }}
                            style={{
                                fontSize: '15px',
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#5F6180', fillOpacity: '0.3' }}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                            {vaultPnls.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? Colors.GREEN : Colors.RED} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    align-items: center;
    width: 100%;
`;

const ChartContainer = styled.div`
    height: 250px;
    width: 100%;
`;

const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 100%;
    margin-top: 20px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
    text-align: center;
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

export default PnL;

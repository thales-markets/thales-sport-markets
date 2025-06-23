import { USD_SIGN } from 'constants/currency';
import React from 'react';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { PositionStats, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getPositionTextV2 } from 'utils/marketsV2';
import { PositionInfo, PositionText, SelectionInfoContainer, TicketRow, Value } from './styled-components';

type PositionStatsRowProps = {
    positionStats: PositionStats;
    market: TicketMarket;
};

const PositionStatsRow: React.FC<PositionStatsRowProps> = ({ positionStats, market }) => {
    const theme: ThemeInterface = useTheme();

    return (
        <TicketRow highlighted={positionStats.isWinning} style={{ opacity: getOpacity(positionStats) }}>
            <SelectionInfoContainer>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(market, positionStats.position, true)}</PositionText>
                </PositionInfo>
            </SelectionInfoContainer>
            <Value>{formatCurrencyWithSign(USD_SIGN, positionStats.buyIn, 2)}</Value>
            <Value>{formatCurrencyWithSign(USD_SIGN, positionStats.risk, 2)}</Value>
            <Value
                color={
                    positionStats.pnlIfWin === 0
                        ? theme.status.open
                        : positionStats.pnlIfWin > 0
                        ? theme.status.win
                        : theme.status.loss
                }
            >
                {formatCurrencyWithSign(USD_SIGN, positionStats.pnlIfWin, 2)}
            </Value>
        </TicketRow>
    );
};

const getOpacity = (positionStats: PositionStats) => (positionStats.isResolved && !positionStats.isWinning ? 0.5 : 1);

export default PositionStatsRow;

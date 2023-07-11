import React from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import CombinedOdd from '../CombinedOdd';
import { Status } from '../MatchStatus/MatchStatus';
import { CombinedOddsContainer, Container, Title } from '../Odds/styled-components';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

type CombinedOddsProps = {
    market: SportMarketInfo;
    isShownInSecondRow?: boolean;
};

const CombinedMarketsOdds: React.FC<CombinedOddsProps> = ({ market, isShownInSecondRow }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;

    const combinedMarketPositions = market.combinedMarketsData ? market.combinedMarketsData : [];

    return (
        <Container>
            <Title>{t(`markets.market-card.bet-type.combined-positions`)}</Title>
            {noOdds ? (
                <Status color={theme.status.comingSoon}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <CombinedOddsContainer>
                    {combinedMarketPositions.length &&
                        combinedMarketPositions.map((combinedPosition, index) => {
                            return (
                                <CombinedOdd
                                    key={`combined-odds-${index}-${market.address}-${combinedPosition.positions[0]}-${combinedPosition.positions[1]}`}
                                    markets={combinedPosition.markets}
                                    positions={combinedPosition.positions}
                                    odd={combinedPosition.totalOdd}
                                    bonus={combinedPosition.totalBonus}
                                    isShownInSecondRow={isShownInSecondRow}
                                />
                            );
                        })}
                </CombinedOddsContainer>
            )}
        </Container>
    );
};

export default CombinedMarketsOdds;

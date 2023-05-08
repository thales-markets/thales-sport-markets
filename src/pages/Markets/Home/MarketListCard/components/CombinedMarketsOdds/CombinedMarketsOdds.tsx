import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getAllCombinedMarketsForParentMarket } from 'utils/combinedMarkets';
import CombinedOdd from '../CombinedOdd';
import { Status } from '../MatchStatus/MatchStatus';
import { CombinedOddsContainer, Container, Title } from '../Odds/styled-components';

type CombinedOddsProps = {
    market: SportMarketInfo;
    isShownInSecondRow?: boolean;
};

const CombinedMarketsOdds: React.FC<CombinedOddsProps> = ({ market, isShownInSecondRow }) => {
    const { t } = useTranslation();

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;

    const combinedMarketPositions = getAllCombinedMarketsForParentMarket(market);

    return (
        <Container>
            <Title>{t(`markets.market-card.bet-type.combined-positions`)}</Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <CombinedOddsContainer>
                    {combinedMarketPositions.length &&
                        combinedMarketPositions.map((combinedPosition, index) => {
                            return (
                                <>
                                    <CombinedOdd
                                        key={`combined-odds-${index}-${market.address}`}
                                        markets={combinedPosition.markets}
                                        positions={combinedPosition.positions}
                                        odd={combinedPosition.totalOdd}
                                        bonus={combinedPosition.totalBonus}
                                        isShownInSecondRow={isShownInSecondRow}
                                    />
                                </>
                            );
                        })}
                </CombinedOddsContainer>
            )}
        </Container>
    );
};

export default CombinedMarketsOdds;

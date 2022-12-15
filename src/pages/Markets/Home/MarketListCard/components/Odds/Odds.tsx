import PositionSymbol from 'components/PositionSymbol';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Colors } from 'styles/common';
import { SportMarketInfo } from 'types/markets';
import { formatMarketOdds, getVisibilityOfDrawOptionByTagId, isDiscounted } from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { Status } from '../MatchStatus/MatchStatus';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    market: SportMarketInfo;
};

const Odds: React.FC<OddsProps> = ({ market }) => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;
    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

    return (
        <Container>
            <Title>
                {market.betType === 10001
                    ? `HANDICAP ${market.spread}`
                    : market.betType === 10002
                    ? `TOTAL ${market.total}`
                    : 'WINNER'}
            </Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <OddsContainer>
                    <PositionSymbol
                        marketAddress={market.address}
                        parentMarket={market.parentMarket !== null ? market.parentMarket : market.address}
                        homeTeam={market.homeTeam}
                        awayTeam={market.awayTeam}
                        type={0}
                        symbolColor={Colors.WHITE}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, market.homeOdds),
                            firstTextStyle: { color: Colors.WHITE },
                        }}
                        showTooltip={market.homeOdds == 0}
                        discount={isDiscounted(market.homePriceImpact) ? market.homePriceImpact : undefined}
                        flexDirection="column"
                    />
                    {showDrawOdds && (
                        <PositionSymbol
                            marketAddress={market.address}
                            parentMarket={market.parentMarket !== null ? market.parentMarket : market.address}
                            homeTeam={market.homeTeam}
                            awayTeam={market.awayTeam}
                            type={2}
                            symbolColor={Colors.WHITE}
                            additionalText={{
                                firstText: formatMarketOdds(selectedOddsType, market.drawOdds),
                                firstTextStyle: { color: Colors.WHITE },
                            }}
                            discount={isDiscounted(market.drawPriceImpact) ? market.drawPriceImpact : undefined}
                            showTooltip={market.drawOdds == 0}
                            flexDirection="column"
                        />
                    )}
                    <PositionSymbol
                        marketAddress={market.address}
                        parentMarket={market.parentMarket !== null ? market.parentMarket : market.address}
                        homeTeam={market.homeTeam}
                        awayTeam={market.awayTeam}
                        type={1}
                        symbolColor={Colors.WHITE}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, market.awayOdds),
                            firstTextStyle: { color: Colors.WHITE },
                        }}
                        showTooltip={market.awayOdds == 0}
                        discount={isDiscounted(market.awayPriceImpact) ? market.awayPriceImpact : undefined}
                        flexDirection="column"
                    />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

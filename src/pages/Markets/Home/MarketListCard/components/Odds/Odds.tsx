import PositionSymbol from 'components/PositionSymbol';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Colors } from 'styles/common';
import { formatMarketOdds, isDiscounted } from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { Status } from '../MatchStatus/MatchStatus';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    title?: string;
    noOdds?: boolean;
    isLive?: boolean;
    marketAddress: string;
    homeTeam: string;
    awayTeam: string;
    odds: {
        homeOdds: number;
        awayOdds: number;
        drawOdds?: number;
    };
    awayPriceImpact: number;
    homePriceImpact: number;
    drawPriceImpact: number | undefined;
    isMobile?: boolean;
};

const Odds: React.FC<OddsProps> = ({
    title,
    noOdds,
    marketAddress,
    homeTeam,
    awayTeam,
    odds,
    awayPriceImpact,
    homePriceImpact,
    drawPriceImpact,
    isMobile,
}) => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);

    return (
        <Container>
            <Title>{title}</Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <OddsContainer>
                    <PositionSymbol
                        marketAddress={marketAddress}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        type={0}
                        symbolColor={Colors.WHITE}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, odds?.homeOdds),
                            firstTextStyle: { color: Colors.WHITE },
                        }}
                        showTooltip={odds?.homeOdds == 0}
                        discount={isDiscounted(homePriceImpact) ? homePriceImpact : undefined}
                        isMobile={isMobile}
                        flexDirection="column"
                    />
                    {typeof odds?.drawOdds !== 'undefined' && (
                        <PositionSymbol
                            marketAddress={marketAddress}
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            type={2}
                            symbolColor={Colors.WHITE}
                            additionalText={{
                                firstText: formatMarketOdds(selectedOddsType, odds?.drawOdds),
                                firstTextStyle: { color: Colors.WHITE },
                            }}
                            discount={isDiscounted(drawPriceImpact) ? drawPriceImpact : undefined}
                            showTooltip={odds?.drawOdds == 0}
                            isMobile={isMobile}
                            flexDirection="column"
                        />
                    )}
                    <PositionSymbol
                        marketAddress={marketAddress}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        type={1}
                        symbolColor={Colors.WHITE}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, odds?.awayOdds),
                            firstTextStyle: { color: Colors.WHITE },
                        }}
                        showTooltip={odds?.awayOdds == 0}
                        discount={isDiscounted(awayPriceImpact) ? awayPriceImpact : undefined}
                        isMobile={isMobile}
                        flexDirection="column"
                    />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

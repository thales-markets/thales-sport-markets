import PositionSymbol from 'components/PositionSymbol';
import { ODDS_COLOR, STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { convertFinalResultToResultType, formatMarketOdds, isDiscounted } from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { AccountPosition, PositionType } from '../../../../../../types/markets';
import { Status } from '../MatchStatus/MatchStatus';
import { Container, OddsContainer, WinnerLabel } from './styled-components';

type OddsProps = {
    isResolved?: boolean;
    finalResult?: number;
    isLive?: boolean;
    isCancelled?: boolean;
    marketId: string;
    odds?: {
        homeOdds: number;
        awayOdds: number;
        drawOdds?: number;
    };
    accountPositions?: AccountPosition[];
    isPaused: boolean;
    isApexTopGame: boolean;
    awayPriceImpact: number;
    homePriceImpact: number;
    drawPriceImpact: number | undefined;
    isMobile?: boolean;
};

const Odds: React.FC<OddsProps> = ({
    isResolved,
    finalResult,
    isLive,
    isCancelled,
    marketId,
    odds,
    accountPositions,
    isPaused,
    isApexTopGame,
    awayPriceImpact,
    homePriceImpact,
    drawPriceImpact,
    isMobile,
}) => {
    const { t } = useTranslation();

    const pendingResolution =
        odds?.awayOdds == 0 && odds?.homeOdds == 0 && odds?.awayOdds == 0 && isLive && !isResolved;
    const noOddsFlag =
        odds?.awayOdds == 0 &&
        odds?.homeOdds == 0 &&
        odds?.awayOdds == 0 &&
        !isLive &&
        !isResolved &&
        !isCancelled &&
        !isPaused;
    const resolvedGameFlag = isResolved && finalResult;
    const showOdds = !pendingResolution && !noOddsFlag && !resolvedGameFlag && !isCancelled && !isPaused;
    const selectedOddsType = useSelector(getOddsType);

    return (
        <Container resolved={!!resolvedGameFlag} isMobile={isMobile}>
            {noOddsFlag && <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>}
            {resolvedGameFlag && (
                <>
                    <PositionSymbol type={convertFinalResultToResultType(finalResult, isApexTopGame)} />
                    <WinnerLabel>{t('common.winner')}</WinnerLabel>
                </>
            )}
            {showOdds && (
                <OddsContainer>
                    <PositionSymbol
                        marketId={marketId}
                        type={isApexTopGame ? 3 : 0}
                        symbolColor={ODDS_COLOR.HOME}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, odds?.homeOdds),
                            firstTextStyle: { color: ODDS_COLOR.HOME, marginLeft: '7px' },
                        }}
                        showTooltip={odds?.homeOdds == 0}
                        glow={
                            accountPositions &&
                            !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.home)
                        }
                        discount={isDiscounted(homePriceImpact) ? homePriceImpact : undefined}
                    />
                    {typeof odds?.drawOdds !== 'undefined' && (
                        <PositionSymbol
                            marketId={marketId}
                            type={2}
                            symbolColor={ODDS_COLOR.DRAW}
                            additionalText={{
                                firstText: formatMarketOdds(selectedOddsType, odds?.drawOdds),
                                firstTextStyle: { color: ODDS_COLOR.DRAW, marginLeft: '7px' },
                            }}
                            glow={
                                accountPositions &&
                                !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.draw)
                            }
                            discount={isDiscounted(drawPriceImpact) ? drawPriceImpact : undefined}
                            showTooltip={odds?.drawOdds == 0}
                        />
                    )}
                    <PositionSymbol
                        marketId={marketId}
                        type={isApexTopGame ? 4 : 1}
                        symbolColor={ODDS_COLOR.AWAY}
                        additionalText={{
                            firstText: formatMarketOdds(selectedOddsType, odds?.awayOdds),
                            firstTextStyle: { color: ODDS_COLOR.AWAY, marginLeft: '7px' },
                        }}
                        showTooltip={odds?.awayOdds == 0}
                        glow={
                            accountPositions &&
                            !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.away)
                        }
                        discount={isDiscounted(awayPriceImpact) ? awayPriceImpact : undefined}
                    />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

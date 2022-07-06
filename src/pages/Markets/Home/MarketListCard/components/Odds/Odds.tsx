import PositionSymbol from 'components/PositionSymbol';
import { ODDS_COLOR, STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { convertFinalResultToResultType } from 'utils/markets';
import { Status } from '../MatchStatus/MatchStatus';
import { Container, OddsContainer, WinnerLabel } from './styled-components';

type OddsProps = {
    isResolved?: boolean;
    finalResult?: number;
    isLive?: boolean;
    odds?: {
        homeOdds: number;
        awayOdds: number;
        drawOdds?: number;
    };
};

const Odds: React.FC<OddsProps> = ({ isResolved, finalResult, isLive, odds }) => {
    const { t } = useTranslation();

    const pendingResolution =
        odds?.awayOdds == 0 && odds?.homeOdds == 0 && odds?.awayOdds == 0 && isLive && !isResolved;
    const noOddsFlag = odds?.awayOdds == 0 && odds?.homeOdds == 0 && odds?.awayOdds == 0 && !isLive && !isResolved;
    const resolvedGameFlag = isResolved && finalResult;
    const showOdds = !pendingResolution && !noOddsFlag && !resolvedGameFlag;
    return (
        <Container>
            {noOddsFlag && (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card-list.coming-soon')}</Status>
            )}
            {resolvedGameFlag && (
                <>
                    <PositionSymbol type={convertFinalResultToResultType(finalResult)} />
                    <WinnerLabel>{t('common.winner')}</WinnerLabel>
                </>
            )}
            {showOdds && (
                <OddsContainer>
                    <PositionSymbol
                        type={0}
                        symbolColor={ODDS_COLOR.HOME}
                        additionalText={{
                            firstText: odds?.homeOdds?.toFixed(2),
                            firstTextStyle: { fontSize: '19px', color: ODDS_COLOR.HOME, marginLeft: '10px' },
                        }}
                    />
                    {odds?.drawOdds !== 0 && (
                        <PositionSymbol
                            type={2}
                            symbolColor={ODDS_COLOR.DRAW}
                            additionalText={{
                                firstText: odds?.drawOdds?.toFixed(2),
                                firstTextStyle: { fontSize: '19px', color: ODDS_COLOR.DRAW, marginLeft: '10px' },
                            }}
                        />
                    )}
                    <PositionSymbol
                        type={1}
                        symbolColor={ODDS_COLOR.AWAY}
                        additionalText={{
                            firstText: odds?.awayOdds?.toFixed(2),
                            firstTextStyle: { fontSize: '19px', color: ODDS_COLOR.AWAY, marginLeft: '10px' },
                        }}
                    />
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;

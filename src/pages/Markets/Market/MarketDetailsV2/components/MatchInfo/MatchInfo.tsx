import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Container,
    LeagueLogoContainer,
    ParticipantLogo,
    ParticipantLogoContainer,
    ParticipantsContainer,
    LeagueLogo,
    MatchTimeLabel,
    MatchTime,
    MatchTimeContainer,
    Wrapper,
    TeamNamesWrapper,
    TeamName,
    Versus,
} from './styled-components';
import Tooltip from 'components/Tooltip';
import { SportMarketInfo, SportMarketLiveResult } from 'types/markets';
import { getErrorImage, getLeagueLogoClass, getOnImageError, getTeamImageSource } from 'utils/images';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { convertFinalResultToResultType, isFifaWCGame, isIIHFWCGame, isUEFAGame } from 'utils/markets';
import { FIFA_WC_TAG, FIFA_WC_U20_TAG, SPORTS_TAGS_MAP } from 'constants/tags';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';

type MatchInfoPropsType = {
    market: SportMarketInfo;
    liveResultInfo: SportMarketLiveResult | undefined;
    isEnetpulseSport: boolean;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market, liveResultInfo, isEnetpulseSport }) => {
    const { t } = useTranslation();

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(market.homeTeam, market.tags[0])
            ? getTeamImageSource(market.homeTeam, market.tags[0])
            : getErrorImage(market.tags[0])
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(market.awayTeam, market.tags[0])
            ? getTeamImageSource(market.awayTeam, market.tags[0])
            : getErrorImage(market.tags[0])
    );
    const leagueLogo = getLeagueLogoClass(market.tags[0]);

    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;

    const getTeamsNames = (hideOnMobile: boolean) => (
        <TeamNamesWrapper hideOnMobile={hideOnMobile}>
            <TeamName isHomeTeam={true} isOneSided={market.isOneSideMarket}>
                {market.isOneSideMarket ? fixOneSideMarketCompetitorName(market.homeTeam) : market.homeTeam}
            </TeamName>
            {!market.isOneSideMarket && (
                <>
                    <Versus>{' vs '}</Versus>
                    <TeamName isHomeTeam={false}>{market.awayTeam}</TeamName>
                </>
            )}
        </TeamNamesWrapper>
    );

    return (
        <>
            <Wrapper>
                <Container>
                    <LeagueLogoContainer>
                        <LeagueLogo className={leagueLogo} />
                    </LeagueLogoContainer>
                    <ParticipantsContainer>
                        <ParticipantLogoContainer
                            isWinner={
                                isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == 0
                            }
                            isDraw={isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == 2}
                        >
                            <ParticipantLogo
                                src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])}
                                isFlag={market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG}
                                onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                            />
                        </ParticipantLogoContainer>
                        {!market.isOneSideMarket && (
                            <ParticipantLogoContainer
                                isWinner={
                                    isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == 1
                                }
                                isDraw={
                                    isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == 2
                                }
                                awayTeam={true}
                            >
                                <ParticipantLogo
                                    src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])}
                                    isFlag={market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG}
                                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                />
                            </ParticipantLogoContainer>
                        )}
                    </ParticipantsContainer>
                    {getTeamsNames(false)}
                    <MatchTimeContainer>
                        <MatchTimeLabel>
                            {t('market.match-time')}:
                            {isFifaWCGame(market.tags[0]) && (
                                <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={14} marginLeft={2} />
                            )}
                            {isIIHFWCGame(market.tags[0]) && (
                                <Tooltip overlay={t(`common.iihf-tooltip`)} iconFontSize={12} marginLeft={2} />
                            )}
                            {isUEFAGame(Number(market.tags[0])) && (
                                <Tooltip overlay={t(`common.football-tooltip`)} iconFontSize={12} marginLeft={2} />
                            )}
                        </MatchTimeLabel>
                        <MatchTime>{formatShortDateWithTime(market.maturityDate)}</MatchTime>
                        {isEnetpulseSport && liveResultInfo ? (
                            <>
                                {liveResultInfo.tournamentName ? liveResultInfo.tournamentName : ''}
                                {liveResultInfo.tournamentRound ? ' | ' + liveResultInfo.tournamentRound : ''}
                                {SPORTS_TAGS_MAP['Tennis'].includes(Number(market.tags[0])) && (
                                    <Tooltip overlay={t(`common.tennis-tooltip`)} iconFontSize={14} marginLeft={2} />
                                )}
                            </>
                        ) : (
                            ''
                        )}
                    </MatchTimeContainer>
                </Container>
                {getTeamsNames(true)}
            </Wrapper>
        </>
    );
};

export default MatchInfo;

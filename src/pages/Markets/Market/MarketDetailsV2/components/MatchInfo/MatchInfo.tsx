import React from 'react';
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
    Question,
    MatchTimeContainer,
    Wrapper,
    InnerWrapper,
    MarketNotice,
    MobileContainer,
    MatchTimeContainerMobile,
    TeamNamesWrapper,
    TeamName,
} from './styled-components';
import Tooltip from 'components/Tooltip';

import { MarketData } from 'types/markets';

import { getErrorImage, getLeagueLogoClass, getTeamImageSource } from 'utils/images';
import { formatDateWithTime } from 'utils/formatters/date';
import {
    convertFinalResultToResultType,
    getIsApexTopGame,
    getMarketStatusFromMarketData,
    isApexGame,
} from 'utils/markets';
import { ApexBetTypeKeyMapping, MarketStatus } from 'constants/markets';
import { getIsMobile } from 'redux/modules/app';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { fixLongTeamNameString } from 'utils/formatters/string';

type MatchInfoPropsType = {
    market: MarketData;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market }) => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const homeLogoSrc = getTeamImageSource(market.homeTeam, market.tags[0])
        ? getTeamImageSource(market.homeTeam, market.tags[0])
        : getErrorImage(market.tags[0]);
    const awayLogoSrc = getTeamImageSource(market.awayTeam, market.tags[0]);
    const leagueLogo = getLeagueLogoClass(market.tags[0]);
    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    const isResolved = market?.resolved;
    const matchStartsLabel = isApexGame(market.tags[0]) ? t('market.race-starts') : t('market.match-time');

    return (
        <>
            {isApexTopGame && (
                <Wrapper>
                    <Container>
                        <InnerWrapper>
                            <Question>
                                {t(`common.top-bet-type-title`, {
                                    driver: market.homeTeam,
                                    betType: t(`common.${ApexBetTypeKeyMapping[market.betType]}`),
                                    race: market.leagueRaceName,
                                })}
                            </Question>
                        </InnerWrapper>
                        <InnerWrapper>
                            <ParticipantLogoContainer>
                                <ParticipantLogo src={homeLogoSrc} />
                            </ParticipantLogoContainer>
                        </InnerWrapper>
                        <InnerWrapper>
                            <MatchTimeContainer>
                                <MatchTimeLabel>{t('market.race-starts')}</MatchTimeLabel>
                                <MatchTime>{formatDateWithTime(market.maturityDate)}</MatchTime>
                            </MatchTimeContainer>
                        </InnerWrapper>
                    </Container>
                </Wrapper>
            )}
            {!isApexTopGame && (
                <Wrapper>
                    {!isMobile && (
                        <Container>
                            <LeagueLogoContainer>
                                <LeagueLogo className={leagueLogo} />
                            </LeagueLogoContainer>
                            <ParticipantsContainer>
                                <ParticipantLogoContainer
                                    isWinner={isResolved && convertFinalResultToResultType(market?.finalResult) == 0}
                                    isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                >
                                    <ParticipantLogo src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])} />
                                </ParticipantLogoContainer>
                                <ParticipantLogoContainer
                                    isWinner={isResolved && convertFinalResultToResultType(market?.finalResult) == 1}
                                    isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                    awayTeam={true}
                                >
                                    <ParticipantLogo src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])} />
                                </ParticipantLogoContainer>
                            </ParticipantsContainer>
                            <MatchTimeContainer>
                                <MatchTimeLabel>
                                    {matchStartsLabel}:
                                    {isApexGame(market.tags[0]) && (
                                        <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={15} marginLeft={2} />
                                    )}
                                </MatchTimeLabel>
                                <MatchTime>{formatDateWithTime(market.maturityDate)}</MatchTime>
                            </MatchTimeContainer>
                        </Container>
                    )}
                    {isMobile && (
                        <Container>
                            <MobileContainer>
                                <LeagueLogoContainer>
                                    <LeagueLogo className={leagueLogo} />
                                </LeagueLogoContainer>
                                <ParticipantsContainer>
                                    <ParticipantLogoContainer
                                        isWinner={
                                            isResolved && convertFinalResultToResultType(market?.finalResult) == 0
                                        }
                                        isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                    >
                                        <ParticipantLogo
                                            src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])}
                                        />
                                    </ParticipantLogoContainer>
                                    <ParticipantLogoContainer
                                        isWinner={
                                            isResolved && convertFinalResultToResultType(market?.finalResult) == 1
                                        }
                                        isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                        awayTeam={true}
                                    >
                                        <ParticipantLogo
                                            src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])}
                                        />
                                    </ParticipantLogoContainer>
                                </ParticipantsContainer>
                            </MobileContainer>
                            <MatchTimeContainerMobile>
                                <MatchTimeLabel>
                                    {matchStartsLabel}:
                                    {isApexGame(market.tags[0]) && (
                                        <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={15} marginLeft={2} />
                                    )}
                                </MatchTimeLabel>
                                <MatchTime>{formatDateWithTime(market.maturityDate)}</MatchTime>
                            </MatchTimeContainerMobile>
                        </Container>
                    )}
                    {getMarketStatusFromMarketData(market) !== MarketStatus.Open && (
                        <TeamNamesWrapper>
                            <TeamName>{fixLongTeamNameString(market.homeTeam)}</TeamName>
                            <TeamName>{fixLongTeamNameString(market.awayTeam)}</TeamName>
                        </TeamNamesWrapper>
                    )}
                    {isApexGame(market.tags[0]) && <MarketNotice>{market.leagueRaceName}</MarketNotice>}
                </Wrapper>
            )}
        </>
    );
};

export default MatchInfo;

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
    MobileContainer,
    MatchTimeContainerMobile,
    TeamNamesWrapper,
    TeamName,
    Versus,
} from './styled-components';
import Tooltip from 'components/Tooltip';

import { MarketData } from 'types/markets';

import { getErrorImage, getLeagueLogoClass, getOnImageError, getTeamImageSource } from 'utils/images';
import { formatDateWithTime } from 'utils/formatters/date';
import { convertFinalResultToResultType, isFifaWCGame } from 'utils/markets';
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

    const isResolved = market?.resolved;
    const matchStartsLabel = t('market.match-time');

    return (
        <>
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
                                <ParticipantLogo
                                    src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])}
                                    isFlag={market.tags[0] == 9018}
                                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                                />
                            </ParticipantLogoContainer>
                            <ParticipantLogoContainer
                                isWinner={isResolved && convertFinalResultToResultType(market?.finalResult) == 1}
                                isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                awayTeam={true}
                            >
                                <ParticipantLogo
                                    src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])}
                                    isFlag={market.tags[0] == 9018}
                                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                />
                            </ParticipantLogoContainer>
                        </ParticipantsContainer>
                        <MatchTimeContainer>
                            <MatchTimeLabel>
                                {matchStartsLabel}:
                                {isFifaWCGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={15} marginLeft={2} />
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
                                    isWinner={isResolved && convertFinalResultToResultType(market?.finalResult) == 0}
                                    isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                >
                                    <ParticipantLogo
                                        src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])}
                                        isFlag={market.tags[0] == 9018}
                                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                    />
                                </ParticipantLogoContainer>
                                <ParticipantLogoContainer
                                    isWinner={isResolved && convertFinalResultToResultType(market?.finalResult) == 1}
                                    isDraw={isResolved && convertFinalResultToResultType(market?.finalResult) == 2}
                                    awayTeam={true}
                                >
                                    <ParticipantLogo
                                        src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])}
                                        isFlag={market.tags[0] == 9018}
                                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                    />
                                </ParticipantLogoContainer>
                            </ParticipantsContainer>
                        </MobileContainer>
                        <MatchTimeContainerMobile>
                            <MatchTimeLabel>
                                {matchStartsLabel}:
                                {isFifaWCGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={15} marginLeft={2} />
                                )}
                            </MatchTimeLabel>
                            <MatchTime>{formatDateWithTime(market.maturityDate)}</MatchTime>
                        </MatchTimeContainerMobile>
                    </Container>
                )}
                <TeamNamesWrapper>
                    <TeamName isHomeTeam={true}>{fixLongTeamNameString(market.homeTeam)}</TeamName>
                    <Versus>{' vs '}</Versus>
                    <TeamName isHomeTeam={false}>{fixLongTeamNameString(market.awayTeam)}</TeamName>
                </TeamNamesWrapper>
            </Wrapper>
        </>
    );
};

export default MatchInfo;

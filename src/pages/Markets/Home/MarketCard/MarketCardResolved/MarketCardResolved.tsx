import Button from 'components/Button';
import {
    MatchInfo,
    MatchInfoColumn,
    MatchInfoLabel,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    ScoreLabel,
    WinnerLabel,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React from 'react';
import styled from 'styled-components';
// import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getTeamImageSource } from 'utils/images';

type MarketCardResolvedProps = {
    market: SportMarketInfo;
    isClaimAvailable?: boolean;
};

const MarketCardResolved: React.FC<MarketCardResolvedProps> = ({ market, isClaimAvailable }) => {
    // const { t } = useTranslation();

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 1} finalResult={market.finalResult}>
                    <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                </MatchParticipantImageContainer>
                <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                    WINNER
                </WinnerLabel>
                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                <ScoreLabel>{market.homeScore}</ScoreLabel>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchInfoLabel isClaimAvailable={isClaimAvailable}>
                    {isClaimAvailable ? 'CLAIMABLE' : 'FINISHED'}
                </MatchInfoLabel>
                <ClaimButton onClick={(e: any) => e.preventDefault()}>CLAIM</ClaimButton>
                <MatchVSLabel>VS</MatchVSLabel>
                <WinnerLabel isWinning={market.finalResult == 3} finalResult={market.finalResult}>
                    DRAW
                </WinnerLabel>
                <Tags isFinished={market.finalResult != 0} sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 2} finalResult={market.finalResult}>
                    <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                </MatchParticipantImageContainer>
                <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                    WINNER
                </WinnerLabel>
                <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                <ScoreLabel>{market.awayScore}</ScoreLabel>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

const ClaimButton = styled(Button)`
    position: absolute;
    top: 10%;
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
`;

export default MarketCardResolved;

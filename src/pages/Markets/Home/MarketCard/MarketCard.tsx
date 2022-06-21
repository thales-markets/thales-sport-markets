import {
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    OddsLabel,
    OddsLabelSceleton,
    ScoreLabel,
    WinnerLabel,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React from 'react';
// import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource } from 'utils/images';
import { isClaimAvailable } from 'utils/markets';

type MarketCardProps = {
    market: SportMarketInfo;
    accountPosition?: AccountPosition;
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPosition }) => {
    // const { t } = useTranslation();
    const claimAvailable = isClaimAvailable(market, accountPosition);

    return market.isResolved ? (
        <Container isClaimAvailable={claimAvailable}>
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
                    <MatchDate>FINISHED</MatchDate>
                    <MatchVSLabel>VS</MatchVSLabel>
                    <WinnerLabel isWinning={market.finalResult == 3} finalResult={market.finalResult}>
                        DRAW
                    </WinnerLabel>
                    <Tags isFinished={market.finalResult != 0} tags={market.tags} />
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
        </Container>
    ) : (
        <Container isClaimAvailable={claimAvailable}>
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                        {market.homeOdds.toFixed(2)}
                    </OddsLabel>
                    {/* <OddsLabelSceleton /> */}
                    <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                    <MatchVSLabel>VS</MatchVSLabel>
                    <OddsLabel
                        isTwoPositioned={market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)}
                        isDraw={true}
                    >
                        {market.awayOdds == 0 && market.homeOdds == 0 ? 'Coming Soon!' : market.drawOdds.toFixed(2)}
                    </OddsLabel>
                    {/* <OddsLabelSceleton isTwoPositioned={market.drawOdds === 0} /> */}
                    <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                    <Tags tags={market.tags} />
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                    {market ? (
                        <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                            {market.awayOdds.toFixed(2)}
                        </OddsLabel>
                    ) : (
                        <OddsLabelSceleton />
                    )}
                    <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                </MatchInfoColumn>
            </MatchInfo>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{ isClaimAvailable: boolean }>`
    box-sizing: border-box;
    border-radius: 14px;
    padding: 16px 19px;
    margin: 20px 10px;
    max-height: 275px;
    background: ${(props) => props.theme.background.secondary};
    &:hover {
        border-color: transparent;
        background-origin: border-box;
    }
`;

// const Checkmark = styled.span`
//     :after {
//         content: '';
//         position: absolute;
//         left: -17px;
//         top: -1px;
//         width: 5px;
//         height: 14px;
//         border: solid ${(props) => props.theme.borderColor.primary};
//         border-width: 0 3px 3px 0;
//         -webkit-transform: rotate(45deg);
//         -ms-transform: rotate(45deg);
//         transform: rotate(45deg);
//     }
// `;

export default MarketCard;

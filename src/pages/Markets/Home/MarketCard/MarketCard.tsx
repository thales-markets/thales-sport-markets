import {
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchParticipantImageContainer,
    MatchParticipantImage,
    MatchParticipantName,
    OddsLabel,
    MatchVSLabel,
    OddsLabelSceleton,
    WinnerLabel,
    ScoreLabel,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import useNormalizedOddsQuery from 'queries/markets/useNormalizedOddsQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
// import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { isClaimAvailable } from 'utils/markets';
import { getTeamImageSource } from 'utils/images';

type MarketCardProps = {
    market: SportMarketInfo;
    accountPosition?: AccountPosition;
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPosition }) => {
    // const { t } = useTranslation();
    const claimAvailable = isClaimAvailable(market, accountPosition);
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    //TODO - THERE WILL BE NO NEED FOR QUERYING FOR NORMALIZED ODDS, SINCE CONTRACT SIDE WILL PROVIDE NORMALIZED ODDS SINCE MARKET CREATION EVENT - TO BE REMOVED
    const [sportMarketWithNormalizedOdds, setSportMarketWithNormalizedOdds] = useState<SportMarketInfo>();
    const normalizedOddsQuery = useNormalizedOddsQuery(market, networkId, { enabled: isAppReady });

    useEffect(() => {
        if (normalizedOddsQuery.isSuccess && normalizedOddsQuery.data) {
            setSportMarketWithNormalizedOdds(normalizedOddsQuery.data);
        }
    }, [normalizedOddsQuery.isSuccess, normalizedOddsQuery.data]);

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
                    {sportMarketWithNormalizedOdds ? (
                        <OddsLabel
                            noOdds={
                                sportMarketWithNormalizedOdds.awayOdds == 0 &&
                                sportMarketWithNormalizedOdds.homeOdds == 0
                            }
                            homeOdds={true}
                        >
                            {sportMarketWithNormalizedOdds.homeOdds.toFixed(2)}
                        </OddsLabel>
                    ) : (
                        <OddsLabelSceleton />
                    )}
                    <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                    <MatchVSLabel>VS</MatchVSLabel>
                    {sportMarketWithNormalizedOdds ? (
                        <OddsLabel
                            isTwoPositioned={
                                sportMarketWithNormalizedOdds.drawOdds === 0 &&
                                !(
                                    sportMarketWithNormalizedOdds.awayOdds == 0 &&
                                    sportMarketWithNormalizedOdds.homeOdds == 0
                                )
                            }
                            isDraw={true}
                        >
                            {sportMarketWithNormalizedOdds.awayOdds == 0 && sportMarketWithNormalizedOdds.homeOdds == 0
                                ? 'Coming Soon!'
                                : sportMarketWithNormalizedOdds.drawOdds.toFixed(2)}
                        </OddsLabel>
                    ) : (
                        <OddsLabelSceleton isTwoPositioned={market.drawOdds === 0} />
                    )}
                    <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                    <Tags tags={market.tags} />
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                    {sportMarketWithNormalizedOdds ? (
                        <OddsLabel
                            noOdds={
                                sportMarketWithNormalizedOdds.awayOdds == 0 &&
                                sportMarketWithNormalizedOdds.homeOdds == 0
                            }
                            homeOdds={false}
                        >
                            {sportMarketWithNormalizedOdds.awayOdds.toFixed(2)}
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

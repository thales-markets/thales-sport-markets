import {
    MatchInfo,
    MatchInfoColumn,
    MatchInfoLabel,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    OddsLabel,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React from 'react';
// import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getTeamImageSource } from 'utils/images';

type MarketCardCanceledProps = {
    market: SportMarketInfo;
    isClaimAvailable?: boolean;
};

const MarketCardCanceled: React.FC<MarketCardCanceledProps> = ({ market, isClaimAvailable }) => {
    // const { t } = useTranslation();

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                </MatchParticipantImageContainer>
                <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                    {market.homeOdds.toFixed(2)}
                </OddsLabel>
                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchInfoLabel isCanceledMarket={true}>CANCELED</MatchInfoLabel>
                <MatchVSLabel>VS</MatchVSLabel>
                <OddsLabel
                    isTwoPositioned={market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)}
                    isDraw={true}
                >
                    {isClaimAvailable ? 'Claim back your funds' : market.drawOdds.toFixed(2)}
                </OddsLabel>
                <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                </MatchParticipantImageContainer>
                <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                    {market.awayOdds.toFixed(2)}
                </OddsLabel>
                <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

export default MarketCardCanceled;

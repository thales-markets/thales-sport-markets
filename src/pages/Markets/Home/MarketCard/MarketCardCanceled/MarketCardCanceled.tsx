import {
    MatchInfo,
    MatchInfoColumn,
    MatchInfoLabel,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    OddsLabel,
    OddsLabelSceleton,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import useMarketCancellationOddsQuery from 'queries/markets/useMarketCancellationOddsQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
// import { useTranslation } from 'react-i18next';
import { Odds, SportMarketInfo } from 'types/markets';
import { getTeamImageSource, OVERTIME_LOGO } from 'utils/images';

type MarketCardCanceledProps = {
    market: SportMarketInfo;
};

const MarketCardCanceled: React.FC<MarketCardCanceledProps> = ({ market }) => {
    // const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const marketCancellationOddsQuery = useMarketCancellationOddsQuery(market.address, { enabled: isAppReady });
    const [oddsOnCancellation, setOddsOnCancellation] = useState<Odds | undefined>(undefined);

    useEffect(() => {
        if (marketCancellationOddsQuery.isSuccess && marketCancellationOddsQuery.data) {
            setOddsOnCancellation(marketCancellationOddsQuery.data);
        }
    }, [marketCancellationOddsQuery.isSuccess, marketCancellationOddsQuery.data]);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage src={homeLogoSrc} onError={() => setHomeLogoSrc(OVERTIME_LOGO)} />
                </MatchParticipantImageContainer>
                {oddsOnCancellation ? (
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                        {oddsOnCancellation.home.toFixed(2)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}

                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchInfoLabel isCanceledMarket={true}>CANCELED</MatchInfoLabel>
                <MatchVSLabel>VS</MatchVSLabel>
                {oddsOnCancellation ? (
                    <OddsLabel
                        isTwoPositioned={market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)}
                        isDraw={true}
                    >
                        {oddsOnCancellation.draw.toFixed(2)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}
                <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage src={awayLogoSrc} onError={() => setAwayLogoSrc(OVERTIME_LOGO)} />
                </MatchParticipantImageContainer>
                {oddsOnCancellation ? (
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                        {oddsOnCancellation?.away.toFixed(2)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}

                <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

export default MarketCardCanceled;

import {
    MarketInfoContainer,
    MatchDate,
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
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { formatMarketOdds } from '../../../../../utils/markets';
import { getOddsType } from '../../../../../redux/modules/ui';
import { formatDateWithTime } from 'utils/formatters/date';

type MarketCardCanceledProps = {
    market: SportMarketInfo;
};

const MarketCardCanceled: React.FC<MarketCardCanceledProps> = ({ market }) => {
    // const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const marketCancellationOddsQuery = useMarketCancellationOddsQuery(market.address, { enabled: isAppReady });
    const [oddsOnCancellation, setOddsOnCancellation] = useState<Odds | undefined>(undefined);
    const selectedOddsType = useSelector(getOddsType);

    useEffect(() => {
        if (marketCancellationOddsQuery.isSuccess && marketCancellationOddsQuery.data) {
            setOddsOnCancellation(marketCancellationOddsQuery.data);
        }
    }, [marketCancellationOddsQuery.isSuccess, marketCancellationOddsQuery.data]);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                {oddsOnCancellation ? (
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                        {formatMarketOdds(selectedOddsType, oddsOnCancellation?.home)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}

                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MarketInfoContainer>
                    <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                    <MatchInfoLabel isCanceledMarket={true}>CANCELED</MatchInfoLabel>
                </MarketInfoContainer>
                <MatchVSLabel>VS</MatchVSLabel>
                {oddsOnCancellation ? (
                    <OddsLabel
                        isTwoPositioned={market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)}
                        isDraw={true}
                    >
                        {formatMarketOdds(selectedOddsType, oddsOnCancellation?.draw)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}
                <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage
                        alt="Away team logo"
                        src={awayLogoSrc}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                {oddsOnCancellation ? (
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                        {formatMarketOdds(selectedOddsType, oddsOnCancellation?.away)}
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

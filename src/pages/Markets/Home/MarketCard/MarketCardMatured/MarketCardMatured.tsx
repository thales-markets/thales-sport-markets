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
import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { useSelector } from 'react-redux';
import { getOddsType } from '../../../../../redux/modules/ui';
import { formatMarketOdds } from '../../../../../utils/markets';

type MarketCardMaturedProps = {
    market: SportMarketInfo;
};

const MarketCardMatured: React.FC<MarketCardMaturedProps> = ({ market }) => {
    // const { t } = useTranslation();
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && market.awayOdds == 0;

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));
    const selectedOddsType = useSelector(getOddsType);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam]);

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer>
                    <MatchParticipantImage
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                    {formatMarketOdds(selectedOddsType, market.homeOdds)}
                </OddsLabel>
                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchInfoLabel pendingResolution={noOdds} isMaturedMarket={true}>
                    {'PENDING RESOLUTION'}
                </MatchInfoLabel>
                <MatchVSLabel pendingResolution={noOdds}>VS</MatchVSLabel>
                <OddsLabel
                    noOdds={noOdds}
                    isTwoPositioned={market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)}
                    isDraw={true}
                >
                    {formatMarketOdds(selectedOddsType, market.drawOdds)}
                </OddsLabel>
                <MatchParticipantName isTwoPositioned={market.drawOdds === 0}>{'DRAW'}</MatchParticipantName>
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer>
                    <MatchParticipantImage
                        alt="Away team logo"
                        src={awayLogoSrc}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                    {formatMarketOdds(selectedOddsType, market.awayOdds)}
                </OddsLabel>
                <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

export default MarketCardMatured;

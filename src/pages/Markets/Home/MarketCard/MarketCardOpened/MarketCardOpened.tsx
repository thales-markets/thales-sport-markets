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
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { AccountPosition, PositionType, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource, OVERTIME_LOGO } from 'utils/images';
import { ODDS_COLOR } from '../../../../../constants/ui';

type MarketCardOpenedProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketCardOpened: React.FC<MarketCardOpenedProps> = ({ market, accountPositions }) => {
    // const { t } = useTranslation();

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

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
                        onError={() => setHomeLogoSrc(OVERTIME_LOGO)}
                    />
                </MatchParticipantImageContainer>
                <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                    {market.homeOdds.toFixed(2)}
                </OddsLabel>
                <MatchParticipantName
                    glowColor={ODDS_COLOR.HOME}
                    glow={
                        accountPositions &&
                        !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.home)
                    }
                >
                    {market.homeTeam}
                </MatchParticipantName>
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
                <MatchParticipantName
                    isTwoPositioned={market.drawOdds === 0}
                    glowColor={ODDS_COLOR.DRAW}
                    glow={
                        accountPositions &&
                        !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.draw)
                    }
                >
                    {'DRAW'}
                </MatchParticipantName>
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer>
                    <MatchParticipantImage
                        alt="Away team logo"
                        src={awayLogoSrc}
                        onError={() => setAwayLogoSrc(OVERTIME_LOGO)}
                    />
                </MatchParticipantImageContainer>
                {market ? (
                    <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                        {market.awayOdds.toFixed(2)}
                    </OddsLabel>
                ) : (
                    <OddsLabelSceleton />
                )}
                <MatchParticipantName
                    glowColor={ODDS_COLOR.AWAY}
                    glow={
                        accountPositions &&
                        !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.away)
                    }
                >
                    {market.awayTeam}
                </MatchParticipantName>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

export default MarketCardOpened;

import { COUNTRY_BASED_TOURNAMENTS } from 'constants/markets';
import { getLeagueSport } from 'overtime-utils';
import React, { useState } from 'react';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { useSelector } from 'react-redux';
import { getIsMarketSelected } from 'redux/modules/market';
import { FlexDivRowCentered } from 'styles/common';
import { SportMarket, SportMarkets } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import MarketListCardV2 from '../../MarketListCard';
import {
    ArrowIcon,
    GamesContainer,
    LeagueFlag,
    LeagueName,
    TournamentCard,
    TournamentInfo,
} from '../styled-components';

type TournamentMarketsListProps = {
    markets: SportMarkets;
    tournament: string;
    leagueId: number;
    language: string;
};

const TournamentMarketsList: React.FC<TournamentMarketsListProps> = ({ markets, tournament, leagueId, language }) => {
    const isMarketSelected = useSelector(getIsMarketSelected);
    const [hideTournament, setHideTournament] = useState<boolean>(false);

    const leagueSport = getLeagueSport(leagueId);
    const tournamentNameSplit = tournament.split(',');
    const tournamentCountry =
        tournamentNameSplit.length > 0 && COUNTRY_BASED_TOURNAMENTS.includes(leagueSport)
            ? tournamentNameSplit[tournamentNameSplit.length - 1].trim()
            : '';

    return (
        <>
            <TournamentCard isMarketSelected={isMarketSelected}>
                <TournamentInfo
                    onClick={() => {
                        if (hideTournament) {
                            setHideTournament(false);
                        } else {
                            setHideTournament(true);
                        }
                        setTimeout(() => {
                            forceCheck();
                        }, 1);
                    }}
                >
                    <FlexDivRowCentered>
                        <LeagueFlag alt={tournamentCountry} src={getLeagueFlagSource(leagueId, tournamentCountry)} />
                        <LeagueName>{tournament}</LeagueName>
                    </FlexDivRowCentered>
                    {hideTournament ? (
                        <ArrowIcon className={`icon icon--caret-right`} />
                    ) : (
                        <ArrowIcon down={true} className={`icon icon--caret-down`} />
                    )}
                </TournamentInfo>
            </TournamentCard>

            <GamesContainer hidden={hideTournament}>
                {markets.map((market: SportMarket, index: number) => (
                    <LazyLoad height={130} key={index + 'list'} offset={800}>
                        <MarketListCardV2 language={language} market={market} showLeagueInfo={!leagueId} />
                    </LazyLoad>
                ))}
            </GamesContainer>
        </>
    );
};

export default TournamentMarketsList;

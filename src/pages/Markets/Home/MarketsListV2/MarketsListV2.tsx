import IncentivizedLeague from 'components/IncentivizedLeague';
import { SPORTS_BY_TOURNAMENTS } from 'constants/markets';
import { SportFilter } from 'enums/markets';
import { groupBy, orderBy } from 'lodash';
import { getLeagueLabel, isOneSideMarket, MarketType } from 'overtime-utils';
import React, { useMemo, useState } from 'react';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMarketSelected, getSportFilter } from 'redux/modules/market';
import { getFavouriteLeagues, setFavouriteLeague } from 'redux/modules/ui';
import { SportMarket, SportMarkets, TagInfo } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import MarketListCardV2 from '../MarketListCard';
import GameList from './GameList';
import {
    ArrowIcon,
    GamesContainer,
    LeagueCard,
    LeagueFlag,
    LeagueInfo,
    LeagueName,
    StarIcon,
} from './styled-components';
import TournamentMarketsList from './TournamentMarketsList';

type MarketsListProps = {
    markets: SportMarkets;
    league?: number;
    language: string;
};

const MarketsList: React.FC<MarketsListProps> = ({ markets, league, language }) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const [hideLeague, setHideLeague] = useState<boolean>(false);
    const sportFilter = useSelector(getSportFilter);

    const isPlayerPropsSelected = useMemo(() => sportFilter === SportFilter.PlayerProps, [sportFilter]);
    const isSportByTournamentSelected = useMemo(() => SPORTS_BY_TOURNAMENTS.includes(markets[0]?.sport), [markets]);

    const leagueName = league
        ? getLeagueLabel(league)
        : isPlayerPropsSelected
        ? getLeagueLabel(markets[0].leagueId) // when not grouped by league
        : '';
    const isFavourite = !!favouriteLeagues.find((favourite: TagInfo) => favourite.id == league);

    const sortedMarkets = league ? sortWinnerMarkets(markets, league, markets[0].typeId) : markets;

    const marketsMapByGame: Record<string, SportMarket[]> | null = useMemo(
        () => (isPlayerPropsSelected ? groupBy(markets, (market) => market.gameId) : null),
        [markets, isPlayerPropsSelected]
    );

    const marketsMapByTournament: Record<string, SportMarket[]> | null = useMemo(
        () => (isSportByTournamentSelected ? groupBy(markets, (market) => market.tournamentName) : null),
        [isSportByTournamentSelected, markets]
    );

    return (
        <>
            {league && (
                <LeagueCard isMarketSelected={isMarketSelected}>
                    <LeagueInfo
                        onClick={() => {
                            if (hideLeague) {
                                setHideLeague(false);
                            } else {
                                setHideLeague(true);
                            }
                            setTimeout(() => {
                                forceCheck();
                            }, 1);
                        }}
                    >
                        <LeagueFlag alt={league.toString()} src={getLeagueFlagSource(Number(league))} />
                        <LeagueName>{leagueName}</LeagueName>
                        {hideLeague ? (
                            <ArrowIcon className={`icon icon--caret-right`} />
                        ) : (
                            <ArrowIcon down={true} className={`icon icon--caret-down`} />
                        )}
                    </LeagueInfo>
                    {!isMarketSelected && (
                        <>
                            <IncentivizedLeague league={league} />
                            <StarIcon
                                onClick={() => {
                                    dispatch(setFavouriteLeague(league));
                                }}
                                className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                            />
                        </>
                    )}
                </LeagueCard>
            )}
            {isPlayerPropsSelected && marketsMapByGame ? (
                <>
                    {Object.keys(marketsMapByGame).map((key) => (
                        <GamesContainer key={key} hidden={hideLeague}>
                            <GameList markets={marketsMapByGame[key]} language={language} />
                        </GamesContainer>
                    ))}
                </>
            ) : isSportByTournamentSelected && marketsMapByTournament && league ? (
                <GamesContainer hidden={hideLeague && !!league}>
                    {Object.keys(marketsMapByTournament).map((key) => (
                        <TournamentMarketsList
                            key={key}
                            markets={marketsMapByTournament[key]}
                            tournament={key}
                            leagueId={league}
                            language={language}
                        />
                    ))}
                </GamesContainer>
            ) : (
                <GamesContainer hidden={hideLeague && !!league}>
                    {sortedMarkets.map((market: SportMarket, index: number) => (
                        <LazyLoad height={130} key={index + 'list'} offset={800}>
                            <MarketListCardV2 language={language} market={market} showLeagueInfo={!league} />
                        </LazyLoad>
                    ))}
                </GamesContainer>
            )}
        </>
    );
};

const sortWinnerMarkets = (markets: SportMarkets, leagueId: number, typeId: MarketType) => {
    if (isOneSideMarket(leagueId, typeId)) {
        return orderBy(markets, ['maturityDate', 'odds[0]'], ['asc', 'desc']);
    }
    return markets;
};

export default MarketsList;

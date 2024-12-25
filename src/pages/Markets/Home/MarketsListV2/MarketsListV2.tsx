import IncentivizedLeague from 'components/IncentivizedLeague';
import { SportFilter } from 'enums/markets';
import { groupBy, orderBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMarketSelected, getSportFilter } from 'redux/modules/market';
import { getFavouriteLeagues, setFavouriteLeague } from 'redux/modules/ui';
import { SportMarket, SportMarkets, TagInfo } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import { isOneSideMarket } from 'utils/markets';
import { getLeagueLabel } from '../../../../utils/sports';
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

    const leagueName = league ? getLeagueLabel(league) : '';
    const isFavourite = !!favouriteLeagues.find((favourite: TagInfo) => favourite.id == league);

    const sortedMarkets = league ? sortWinnerMarkets(markets, league) : markets;

    const marketsMapByGame: Record<string, SportMarket[]> | null = useMemo(
        () => (isPlayerPropsSelected ? groupBy(markets, (market) => market.gameId) : null),
        [markets, isPlayerPropsSelected]
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
                    {!isMarketSelected ? (
                        <>
                            <IncentivizedLeague league={league} />
                            <StarIcon
                                onClick={() => {
                                    dispatch(setFavouriteLeague(league));
                                }}
                                className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                            />
                        </>
                    ) : (
                        <></>
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
            ) : (
                <GamesContainer hidden={hideLeague}>
                    {sortedMarkets.map((market: SportMarket, index: number) => (
                        <LazyLoad height={130} key={index + 'list'} offset={800}>
                            <MarketListCardV2 language={language} market={market} />
                        </LazyLoad>
                    ))}
                </GamesContainer>
            )}
        </>
    );
};

const sortWinnerMarkets = (markets: SportMarkets, leagueId: number) => {
    if (isOneSideMarket(leagueId)) {
        return orderBy(markets, ['maturityDate', 'odds[0]'], ['asc', 'desc']);
    }
    return markets;
};

export default MarketsList;

import IncentivizedLeague from 'components/IncentivizedLeague';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMarketSelected } from 'redux/modules/market';
import { getFavouriteLeagues, setFavouriteLeague } from 'redux/modules/ui';
import styled from 'styled-components';
import { SportMarket, SportMarkets, TagInfo } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import { isOneSideMarket } from 'utils/markets';
import { getLeagueLabel } from '../../../../utils/sports';
import MarketListCardV2 from '../MarketListCard';

type MarketsListProps = {
    markets: SportMarkets;
    league: number;
    language: string;
};

const MarketsList: React.FC<MarketsListProps> = ({ markets, league, language }) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const [hideLeague, setHideLeague] = useState<boolean>(false);

    const leagueName = getLeagueLabel(league);
    const isFavourite = !!favouriteLeagues.find((favourite: TagInfo) => favourite.id == league);

    const sortedMarkets = sortWinnerMarkets(markets, league);

    return (
        <>
            <LeagueCard isMarketSelected={isMarketSelected}>
                <LeagueInfo
                    onClick={() => {
                        if (hideLeague) {
                            setHideLeague(false);
                        } else {
                            setHideLeague(true);
                        }
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
            <GamesContainer hidden={hideLeague}>
                {sortedMarkets.map((market: SportMarket, index: number) => (
                    <MarketListCardV2 language={language} market={market} key={index + 'list'} />
                ))}
            </GamesContainer>
        </>
    );
};

const sortWinnerMarkets = (markets: SportMarkets, leagueId: number) => {
    if (isOneSideMarket(leagueId)) {
        return orderBy(markets, ['maturityDate', 'odds[0]'], ['asc', 'desc']);
    }
    return markets;
};

const LeagueCard = styled.div<{ isMarketSelected: boolean }>`
    display: flex;
    position: relative;
    flex-direction: row;
    padding: 0px 12px 10px 12px;
    border-radius: 5px;
    align-items: center;
    background-color: ${(props) => props.theme.background.primary};
    justify-content: space-between;
    padding-right: ${(props) => (props.isMarketSelected ? '0px' : '40px')};
`;

const LeagueInfo = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    cursor: pointer;
    align-items: center;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.primary};
        }
    }
`;

const GamesContainer = styled.div<{ hidden?: boolean }>`
    display: ${(props) => (props.hidden ? 'none' : 'flex')};
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
`;

const LeagueFlag = styled.img`
    width: 24px;
    height: 24px;
    cursor: pointer;
`;

const LeagueName = styled.label`
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 10px;
    &:hover {
        cursor: pointer;
    }
`;

const ArrowIcon = styled.i<{ down?: boolean }>`
    font-size: 16px;
    margin-left: 10px;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.primary};
        }
    }
`;

const StarIcon = styled.i`
    font-size: 20px;
    position: absolute;
    right: 10px;
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

export default MarketsList;

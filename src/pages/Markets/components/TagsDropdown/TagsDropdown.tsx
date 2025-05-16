import { SportFilter } from 'enums/markets';
import { getSportLeagueIds, LeagueMap, Sport } from 'overtime-utils';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { TagInfo, Tags, Tournament } from 'types/markets';
import Tag from '../Tag';

const favouritesTag = {
    id: -1,
    label: SportFilter.Favourites,
};

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    setTagFilter: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
    liveMarketsCountPerSport: any;
    playerPropsMarketsCountPerTag: any;
    showActive: boolean;
    showLive: boolean;
    sport: SportFilter;
    tournamentsByLeague: Record<number, Tournament[]>;
    marketsCountPerTournament: any;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({
    open,
    tags,
    setTagFilter,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
    liveMarketsCountPerSport,
    playerPropsMarketsCountPerTag,
    showActive,
    showLive,
    sport,
    tournamentsByLeague,
    marketsCountPerTournament,
}) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const tagsPerSport = getSportLeagueIds((sport as unknown) as Sport);

    const isPlayerPropsTag = sport == SportFilter.PlayerProps;
    const isFavouritesTag = sport == SportFilter.Favourites;
    const isLiveTag = sport == SportFilter.Live;

    return (
        <>
            {open && (
                <Container>
                    {(isFavouritesTag ? favouriteLeagues : isLiveTag ? [...tags, favouritesTag] : tags)
                        .filter((tag: TagInfo) => {
                            if (showLive) {
                                return !!liveMarketsCountPerTag[tag.id] || tag.label === SportFilter.Favourites;
                            } else if (isPlayerPropsTag) {
                                return !!playerPropsMarketsCountPerTag[tag.id];
                            } else {
                                if (!isFavouritesTag && !tagsPerSport.includes(tag.id)) {
                                    return false;
                                }
                                return (showActive && !!openMarketsCountPerTag[tag.id]) || !showActive;
                            }
                        })
                        .sort((a: TagInfo, b: TagInfo) => {
                            if (a.label === SportFilter.Favourites) {
                                return -1;
                            }
                            let numberOfGamesA;
                            let numberOfGamesB;
                            if (showLive) {
                                numberOfGamesA = Number(!!liveMarketsCountPerTag[a.id]);
                                numberOfGamesB = Number(!!liveMarketsCountPerTag[b.id]);
                            } else {
                                numberOfGamesA = Number(!!openMarketsCountPerTag[a.id]);
                                numberOfGamesB = Number(!!openMarketsCountPerTag[b.id]);
                            }

                            const isFavouriteA = Number(
                                !!favouriteLeagues.find((league: TagInfo) => league.id == a.id)
                            );
                            const isFavouriteB = Number(
                                !!favouriteLeagues.find((league: TagInfo) => league.id == b.id)
                            );

                            const leagueInfoA = LeagueMap[a.id];
                            const leagueInfoB = LeagueMap[b.id];

                            const leagueNameA = leagueInfoA?.label || '';
                            const leagueNameB = leagueInfoB?.label || '';

                            const leaguePriorityA = leagueInfoA?.priority || 0;
                            const leaguePriorityB = leagueInfoB?.priority || 0;

                            return isFavouriteA == isFavouriteB
                                ? numberOfGamesA == numberOfGamesB
                                    ? leaguePriorityA > leaguePriorityB
                                        ? 1
                                        : leaguePriorityA < leaguePriorityB
                                        ? -1
                                        : leagueNameA > leagueNameB
                                        ? 1
                                        : -1
                                    : numberOfGamesB - numberOfGamesA
                                : isFavouriteB - isFavouriteA;
                        })
                        .map((tag: TagInfo) => {
                            return (
                                <Tag
                                    key={tag.label + '1'}
                                    setTagFilter={(tagFilter: Tags) => dispatch(setTagFilter(tagFilter))}
                                    openMarketsCountPerTag={openMarketsCountPerTag}
                                    liveMarketsCountPerTag={liveMarketsCountPerTag}
                                    liveMarketsCountPerSport={liveMarketsCountPerSport}
                                    playerPropsMarketsCountPerTag={playerPropsMarketsCountPerTag}
                                    showLive={sport == SportFilter.Live}
                                    sport={sport}
                                    marketsCountPerTournament={marketsCountPerTournament}
                                    tag={tag}
                                    tournaments={tournamentsByLeague[tag.id] || []}
                                ></Tag>
                            );
                        })}
                </Container>
            )}
        </>
    );
};

const Container = styled.div``;

export default TagsDropdown;

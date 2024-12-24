import { SportFilter } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter, setMarketTypeFilter, setMarketTypeGroupFilter } from 'redux/modules/market';
import { getFavouriteLeagues, setFavouriteLeague } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import { getScrollMainContainerToTop } from 'utils/scroll';
import IncentivizedLeague from '../../../../components/IncentivizedLeague';
import { LeagueMap } from '../../../../constants/sports';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: Tags;
    setTagFilter: any;
    setTagParam: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
    playerPropsMarketsCountPerTag: any;
    showActive: boolean;
    showLive: boolean;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({
    open,
    tags,
    tagFilter,
    setTagFilter,
    setTagParam,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
    playerPropsMarketsCountPerTag,
    showActive,
    showLive,
}) => {
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMobile = useSelector(getIsMobile);
    const tagFilterIds = tagFilter.map((tag) => tag.id);
    const isPlayerPropsTag = sportFilter == SportFilter.PlayerProps;

    return (
        <Container open={open}>
            {tags
                .filter((tag: TagInfo) => {
                    if (showLive) {
                        return !!liveMarketsCountPerTag[tag.id];
                    } else if (isPlayerPropsTag) {
                        return !!playerPropsMarketsCountPerTag[tag.id];
                    } else {
                        return (showActive && !!openMarketsCountPerTag[tag.id]) || !showActive;
                    }
                })
                .sort((a: TagInfo, b: TagInfo) => {
                    let numberOfGamesA;
                    let numberOfGamesB;
                    if (showLive) {
                        numberOfGamesA = Number(!!liveMarketsCountPerTag[a.id]);
                        numberOfGamesB = Number(!!liveMarketsCountPerTag[b.id]);
                    } else {
                        numberOfGamesA = Number(!!openMarketsCountPerTag[a.id]);
                        numberOfGamesB = Number(!!openMarketsCountPerTag[b.id]);
                    }

                    const isFavouriteA = Number(!!favouriteLeagues.find((league: TagInfo) => league.id == a.id));
                    const isFavouriteB = Number(!!favouriteLeagues.find((league: TagInfo) => league.id == b.id));

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
                    const isFavourite = !!favouriteLeagues.find((favourite: TagInfo) => favourite.id == tag.id);
                    const label = tag.label;
                    const scrollMainToTop = getScrollMainContainerToTop();

                    return (
                        <TagContainer key={tag.id} isMobile={isMobile}>
                            <LeftContainer>
                                <LabelContainer
                                    className={`${tagFilterIds.includes(tag.id) ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (tagFilterIds.includes(tag.id)) {
                                            if (isPlayerPropsTag) {
                                                return;
                                            }
                                            const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                            setTagFilter(newTagFilters);
                                            const newTagParam = newTagFilters
                                                .map((tagInfo) => tagInfo.label)
                                                .toString();
                                            setTagParam(newTagParam);
                                            scrollMainToTop();
                                        } else {
                                            if (isPlayerPropsTag) {
                                                dispatch(setMarketTypeFilter(undefined));
                                                dispatch(setMarketTypeGroupFilter(undefined));
                                                setTagFilter([tag]);
                                                setTagParam([tag.label].toString());
                                            } else {
                                                setTagFilter([...tagFilter, tag]);
                                                setTagParam(
                                                    [...tagFilter, tag].map((tagInfo) => tagInfo.label).toString()
                                                );
                                            }
                                            scrollMainToTop();
                                        }
                                    }}
                                >
                                    <LeagueFlag alt={tag.id.toString()} src={getLeagueFlagSource(tag.id)} />
                                    <Label
                                        isMobile={isMobile}
                                        className={`${tagFilterIds.includes(tag.id) ? 'selected' : ''}`}
                                    >
                                        {label}
                                    </Label>
                                    <IncentivizedLeague league={tag.id} onlyLogo />
                                </LabelContainer>
                            </LeftContainer>
                            {showLive
                                ? !!liveMarketsCountPerTag[tag.id] && (
                                      <Count isMobile={isMobile}>{liveMarketsCountPerTag[tag.id]}</Count>
                                  )
                                : isPlayerPropsTag
                                ? !!playerPropsMarketsCountPerTag[tag.id] && (
                                      <Count isMobile={isMobile}>{playerPropsMarketsCountPerTag[tag.id]}</Count>
                                  )
                                : !!openMarketsCountPerTag[tag.id] && (
                                      <Count isMobile={isMobile}>{openMarketsCountPerTag[tag.id]}</Count>
                                  )}
                            <StarIcon
                                isMobile={isMobile}
                                onClick={() => {
                                    dispatch(setFavouriteLeague(tag.id));
                                }}
                                className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                            />
                        </TagContainer>
                    );
                })}
        </Container>
    );
};

const Container = styled.div<{ open: boolean }>`
    display: ${(props) => (!props.open ? 'none' : '')};
`;

const TagContainer = styled(FlexDivRow)<{ isMobile: boolean }>`
    font-style: normal;
    font-weight: 600;
    font-size: ${(props) => (props.isMobile ? '13px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '18px' : '13px')};
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: ${(props) => (props.isMobile ? '28px' : '25px')};
    color: ${(props) => (props.isMobile ? props.theme.textColor.primary : props.theme.textColor.quinary)};
    margin-bottom: 5px;
    justify-content: flex-start;
    position: relative;
    align-items: center;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    width: 100%;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    width: 100%;
    padding-left: 10px;
    justify-content: flex-start;
    &.selected {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (min-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        &:hover {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const Label = styled.div<{ isMobile: boolean }>`
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    margin-left: ${(props) => (props.isMobile ? '20px' : '10px')};
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    &.selected {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (min-width: ${ScreenSizeBreakpoint.MEDIUM}px) {
        &:hover {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const StarIcon = styled.i<{ isMobile: boolean }>`
    font-size: 15px;
    margin-left: ${(props) => (props.isMobile ? '5px' : '5px')};
    &.selected,
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

const LeagueFlag = styled.img`
    width: 18px;
    height: 18px;
`;

const Count = styled(FlexDivCentered)<{ isMobile: boolean }>`
    border-radius: ${(props) => (props.isMobile ? '15px' : '8px')};
    color: ${(props) => (props.isMobile ? props.theme.textColor.tertiary : props.theme.textColor.quaternary)};
    background: ${(props) => (props.isMobile ? props.theme.background.septenary : props.theme.background.primary)};
    border: 2px solid ${(props) => props.theme.background.secondary};
    font-size: ${(props) => (props.isMobile ? '12px' : '12px')};
    min-width: ${(props) => (props.isMobile ? '35px' : '30px')};
    height: ${(props) => (props.isMobile ? '22px' : '18px')};
    line-height: ${(props) => (props.isMobile ? '20px' : '18px')};
    padding: 0 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    margin-right: 5px;
`;

export default TagsDropdown;

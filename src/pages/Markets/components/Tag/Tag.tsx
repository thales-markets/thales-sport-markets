import { SportFilter } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getSportFilter,
    getTagFilter,
    getTournamentFilter,
    setSportFilter,
    setTournamentFilter,
} from 'redux/modules/market';
import { getFavouriteLeagues, setFavouriteLeague } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tournament } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import { getCountryFromTournament } from 'utils/markets';
import { getScrollMainContainerToTop } from 'utils/scroll';
import useQueryParam from 'utils/useQueryParams';
import IncentivizedLeague from '../../../../components/IncentivizedLeague';

type TagProps = {
    setTagFilter: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
    liveMarketsCountPerSport: any;
    playerPropsMarketsCountPerTag: any;
    showLive: boolean;
    sport: SportFilter;
    marketsCountPerTournament: any;
    tag: TagInfo;
    tournaments: Tournament[];
};

const Tag: React.FC<TagProps> = ({
    setTagFilter,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
    liveMarketsCountPerSport,
    playerPropsMarketsCountPerTag,
    showLive,
    sport,
    marketsCountPerTournament,
    tag,
    tournaments,
}) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMobile = useSelector(getIsMobile);
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const tournamentFilter = useSelector(getTournamentFilter);

    const [, setSportParam] = useQueryParam('sport', '');
    const [, setTagParam] = useQueryParam('tag', '');
    const [, setTournamentParam] = useQueryParam('tournament', '');

    const [isOpen, setIsOpen] = useState(!!tagFilter.find((tagInfo) => tagInfo.id === tag.id));

    const tagFilterIds = tagFilter.map((tag) => tag.id);

    const isPlayerPropsTag = sport == SportFilter.PlayerProps;

    const isFavourite = !!favouriteLeagues.find((favourite: TagInfo) => favourite.id == tag.id);
    const label = tag.label;
    const scrollMainToTop = getScrollMainContainerToTop();
    const hasSelectedTournament = tournamentFilter.some((tournament) => tournaments.some((t) => t.name === tournament));

    return (
        <>
            <TagContainer key={tag.id} isMobile={isMobile}>
                <LeftContainer>
                    <LabelContainer
                        className={`${tagFilterIds.includes(tag.id) && sport === sportFilter ? 'selected' : ''}`}
                        onClick={() => {
                            dispatch(setTournamentFilter([]));
                            setTournamentParam('');
                            if (tagFilterIds.includes(tag.id)) {
                                if (sportFilter !== sport) {
                                    dispatch(setSportFilter(sport));
                                    setSportParam(sport);
                                    setTagFilter([tag]);
                                    setTagParam([tag].map((tagInfo) => tagInfo.label).toString());
                                    setIsOpen(true);
                                } else {
                                    if (hasSelectedTournament) {
                                        return;
                                    }
                                    const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                    setTagFilter(newTagFilters);
                                    const newTagParam = newTagFilters.map((tagInfo) => tagInfo.label).toString();
                                    setTagParam(newTagParam);
                                    setIsOpen(false);
                                }

                                scrollMainToTop();
                            } else {
                                if (sportFilter !== sport) {
                                    dispatch(setSportFilter(sport));
                                    setSportParam(sport);
                                    setTagFilter([tag]);
                                    setTagParam([tag].map((tagInfo) => tagInfo.label).toString());
                                    setIsOpen(true);
                                } else {
                                    dispatch(setSportFilter(sport));
                                    setTagFilter([...tagFilter, tag]);
                                    setTagParam([...tagFilter, tag].map((tagInfo) => tagInfo.label).toString());
                                    setIsOpen(true);
                                }
                                scrollMainToTop();
                            }
                        }}
                    >
                        {tag.label === SportFilter.Favourites ? (
                            <StarIcon size={19} isMobile={isMobile} className={`icon icon--favourites`} />
                        ) : (
                            <LeagueFlag alt={tag.id.toString()} src={getLeagueFlagSource(tag.id)} />
                        )}
                        <Label isMobile={isMobile}>{label}</Label>
                        <IncentivizedLeague league={tag.id} onlyLogo />
                    </LabelContainer>
                </LeftContainer>
                {tournaments.length > 0 &&
                    (isOpen ? (
                        <ArrowIcon onClick={() => setIsOpen(false)} className="icon icon--caret-down" />
                    ) : (
                        <ArrowIcon onClick={() => setIsOpen(true)} className="icon icon--caret-right" />
                    ))}
                {tag.label === SportFilter.Favourites ? (
                    <Count isMobile={isMobile}>{liveMarketsCountPerSport[SportFilter.Favourites]}</Count>
                ) : showLive ? (
                    !!liveMarketsCountPerTag[tag.id] && (
                        <Count isMobile={isMobile}>{liveMarketsCountPerTag[tag.id]}</Count>
                    )
                ) : isPlayerPropsTag ? (
                    !!playerPropsMarketsCountPerTag[tag.id] && (
                        <Count isMobile={isMobile}>{playerPropsMarketsCountPerTag[tag.id]}</Count>
                    )
                ) : (
                    !!openMarketsCountPerTag[tag.id] && (
                        <Count isMobile={isMobile}>{openMarketsCountPerTag[tag.id]}</Count>
                    )
                )}
                <StarIcon
                    hidden={tag.label === SportFilter.Favourites}
                    hasMargin
                    isMobile={isMobile}
                    onClick={() => {
                        dispatch(setFavouriteLeague(tag.id));
                    }}
                    className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                />
            </TagContainer>
            {isOpen &&
                tournaments.map((tournament) => {
                    const tournamentCountry = getCountryFromTournament(tournament.name, tag.id);

                    return (
                        <TagContainer key={tournament.name} isMobile={isMobile}>
                            <LeftContainer>
                                <TournamentLabelContainer
                                    className={`${
                                        tournamentFilter.includes(tournament.name) &&
                                        tagFilterIds.includes(tournament.leagueId)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        if (sportFilter !== sport) {
                                            dispatch(setSportFilter(sport));
                                            setSportParam(sport);
                                            setTagFilter([tag]);
                                            setTagParam([tag].map((tagInfo) => tagInfo.label).toString());
                                            dispatch(setTournamentFilter([tournament.name]));
                                            setTournamentParam(tournament.name);
                                        } else {
                                            if (!tagFilterIds.includes(tag.id)) {
                                                setTagFilter([tag]);
                                                setTagParam([tag].map((tagInfo) => tagInfo.label).toString());
                                                dispatch(setTournamentFilter([tournament.name]));
                                                setTournamentParam(tournament.name);
                                            } else {
                                                if (tournamentFilter.includes(tournament.name)) {
                                                    const newTournamentFilters = tournamentFilter.filter(
                                                        (filter) => filter != tournament.name
                                                    );
                                                    dispatch(setTournamentFilter(newTournamentFilters));
                                                    const newTournamentParam = newTournamentFilters.join(';');
                                                    setTournamentParam(newTournamentParam);
                                                } else {
                                                    setTagFilter([tag]);
                                                    setTagParam([tag].map((tagInfo) => tagInfo.label).toString());
                                                    dispatch(
                                                        setTournamentFilter([...tournamentFilter, tournament.name])
                                                    );
                                                    setTournamentParam(
                                                        [...tournamentFilter, tournament.name].join(';')
                                                    );
                                                }
                                            }
                                        }

                                        scrollMainToTop();
                                    }}
                                >
                                    <LeagueFlag
                                        alt={tournamentCountry}
                                        src={getLeagueFlagSource(tag.id, tournamentCountry)}
                                    />
                                    <Label isMobile={isMobile}>{tournament.name}</Label>
                                </TournamentLabelContainer>
                            </LeftContainer>
                            <TournamentCount isMobile={isMobile}>
                                {marketsCountPerTournament[`${tag.id}-${tournament.name}`]}
                            </TournamentCount>
                        </TagContainer>
                    );
                })}
        </>
    );
};

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

const TournamentLabelContainer = styled(LabelContainer)`
    padding-left: 20px;
`;

const Label = styled.div<{ isMobile: boolean }>`
    margin-left: ${(props) => (props.isMobile ? '20px' : '10px')};
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const StarIcon = styled.i<{ isMobile: boolean; hasMargin?: boolean; size?: number; hidden?: boolean }>`
    visibility: ${(props) => (props.hidden ? 'hidden' : 'visible')};
    font-size: ${(props) => (props.size ? `${props.size}px` : '15px')};
    margin-left: ${(props) => (props.hasMargin ? '5px' : '0')};
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

const TournamentCount = styled(Count)`
    margin-right: 26px;
    @media (max-width: 950px) {
        margin-right: 25px;
    }
`;

const ArrowIcon = styled.i`
    display: flex;
    height: 100%;
    align-items: center;
    font-size: 14px;
    text-transform: none;
    font-weight: 400;
    margin-right: 5px;
    margin-top: 2px;
`;

export default Tag;

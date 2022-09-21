import { TAGS_FLAGS } from 'constants/tags';
import React from 'react';
import Flag from 'react-flagpack';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import { useDispatch, useSelector } from 'react-redux';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: Tags;
    setTagFilter: any;
    setTagParam: any;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({ open, tags, tagFilter, setTagFilter, setTagParam }) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const tagFilterIds = tagFilter.map((tag) => tag.id);

    return (
        <Container open={open}>
            {tags
                .filter((tag) => {
                    return !favouriteLeagues.filter((league: TagInfo) => league.id == tag.id)[0].hidden;
                })
                .sort((a, b) => {
                    const isFavouriteA = Number(
                        favouriteLeagues.filter((league: TagInfo) => league.id == a.id)[0].favourite
                    );
                    const isFavouriteB = Number(
                        favouriteLeagues.filter((league: TagInfo) => league.id == b.id)[0].favourite
                    );
                    if (isFavouriteA == isFavouriteB) {
                        return a.label > b.label ? 1 : -1;
                    } else {
                        return isFavouriteB - isFavouriteA;
                    }
                })
                .map((tag: TagInfo) => {
                    const isFavourite = favouriteLeagues.filter((league: TagInfo) => league.id == tag.id)[0].favourite;
                    return (
                        <TagContainer key={tag.id}>
                            <StarIcon
                                onClick={() => {
                                    const newFavourites = favouriteLeagues.map((league: TagInfo) => {
                                        if (league.id == tag.id) {
                                            let newFavouriteFlag;
                                            league.favourite ? (newFavouriteFlag = false) : (newFavouriteFlag = true);
                                            return {
                                                id: league.id,
                                                label: league.label,
                                                logo: league.logo,
                                                favourite: newFavouriteFlag,
                                                hidden: league.hidden,
                                            };
                                        }
                                        return league;
                                    });
                                    dispatch(setFavouriteLeagues(newFavourites));
                                }}
                                className={`icon icon--${isFavourite ? 'star-full selected' : 'star-empty'} `}
                            />
                            <LabelContainer
                                className={`${tagFilterIds.includes(tag.id) ? 'selected' : ''}`}
                                onClick={() => {
                                    if (tagFilterIds.includes(tag.id)) {
                                        const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                        setTagFilter(newTagFilters);
                                        const newTagParam = newTagFilters.map((tagInfo) => tagInfo.label).toString();
                                        setTagParam(newTagParam);
                                    } else {
                                        setTagFilter([...tagFilter, tag]);
                                        setTagParam([...tagFilter, tag].map((tagInfo) => tagInfo.label).toString());
                                    }
                                }}
                            >
                                {LeagueFlag(tag.id)}
                                <Label>{tag.label}</Label>
                            </LabelContainer>
                            <XButton
                                onClick={() => {
                                    const newFavourites = favouriteLeagues.map((league: TagInfo) => {
                                        if (league.id == tag.id) {
                                            let newHiddenFlag;
                                            !league.hidden ? (newHiddenFlag = true) : '';
                                            return {
                                                id: league.id,
                                                label: league.label,
                                                logo: league.logo,
                                                favourite: league.favourite,
                                                hidden: newHiddenFlag,
                                            };
                                        }
                                        return league;
                                    });
                                    dispatch(setFavouriteLeagues(newFavourites));
                                }}
                                className={`icon icon--cross-button`}
                            />
                        </TagContainer>
                    );
                })}
        </Container>
    );
};

const LeagueFlag = (tagId: number | any) => {
    switch (tagId) {
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NFL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.MLB:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NBA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NHL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.WNBA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.MLS:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.EPL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="GB-ENG" />;
        case TAGS_FLAGS.LIGUE_ONE:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="FR" />;
        case TAGS_FLAGS.BUNDESLIGA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="DE" />;
        case TAGS_FLAGS.LA_LIGA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="ES" />;
        case TAGS_FLAGS.SERIE_A:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="IT" />;
        // case TAGS_FLAGS.UEFA_CL:
        //     return <Flag code="EU" />;
        // case TAGS_FLAGS.FORMULA1:
        //     return <Flag code="EU" />;
        // case TAGS_FLAGS.MOTOGP:
        //     return <Flag code="EU" />;
        default:
            return <Flag size="m" code="USA" />;
    }
};

const Container = styled.div<{ open: boolean }>`
    display: ${(props) => (!props.open ? 'none' : '')};
`;

const TagContainer = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: flex-start;
    position: relative;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    margin-left: 20px;
    &.selected,
    &:hover:not(.disabled) {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
`;

const Label = styled.div`
    margin-left: 10px;
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const StarIcon = styled.i`
    font-size: 15px;
    margin-left: 25px;
    &.selected,
    &:hover {
        color: #fac439;
    }
`;

const XButton = styled.i`
    font-size: 15px;
    position: absolute;
    right: 2px;
    color: #ca4c53;
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default TagsDropdown;

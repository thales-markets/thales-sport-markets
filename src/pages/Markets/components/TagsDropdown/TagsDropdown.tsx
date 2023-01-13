import Tooltip from 'components/Tooltip';
import { TAGS_FLAGS } from 'constants/tags';
import React from 'react';
import Flag from 'react-flagpack';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import { OP_INCENTIVIZED_LEAGUE } from 'constants/markets';

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
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const tagFilterIds = tagFilter.map((tag) => tag.id);

    return (
        <Container open={open}>
            {tags
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
                                isMobile={isMobile}
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
                                {OP_INCENTIVIZED_LEAGUE.id == tag.id &&
                                    new Date() > OP_INCENTIVIZED_LEAGUE.startDate &&
                                    new Date() < OP_INCENTIVIZED_LEAGUE.endDate && (
                                        <Tooltip
                                            overlay={
                                                <Trans
                                                    i18nKey="markets.op-incentivized-tooltip"
                                                    components={{
                                                        duneLink: (
                                                            <a
                                                                href="https://dune.com/leifu/overtime-npl-playoff-rewards-leaderboard"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            />
                                                        ),
                                                    }}
                                                />
                                            }
                                            component={
                                                <IncentivizedLeague>
                                                    <OPLogo />
                                                </IncentivizedLeague>
                                            }
                                        ></Tooltip>
                                    )}
                            </LabelContainer>
                        </TagContainer>
                    );
                })}
        </Container>
    );
};

const LeagueFlag = (tagId: number | any) => {
    switch (tagId) {
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.NFL:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.MLB:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.NBA:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.NHL:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.WNBA:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.MLS:
            return <Flag size="m" code="USA" />;
        case TAGS_FLAGS.EPL:
            return <Flag size="m" code="GB-ENG" />;
        case TAGS_FLAGS.LIGUE_ONE:
            return <Flag size="m" code="FR" />;
        case TAGS_FLAGS.BUNDESLIGA:
            return <Flag size="m" code="DE" />;
        case TAGS_FLAGS.LA_LIGA:
            return <Flag size="m" code="ES" />;
        case TAGS_FLAGS.SERIE_A:
            return <Flag size="m" code="IT" />;
        default:
            return <FlagWorld alt="World flag" src="/world-flag.png" />;
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
    margin-left: 10px;
    width: 100%;
    justify-content: flex-start;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }

    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
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

const StarIcon = styled.i<{ isMobile: boolean }>`
    font-size: 15px;
    margin-left: ${(props) => (props.isMobile ? '55px' : '20px')};
    &.selected,
    &:hover {
        color: #fac439;
    }
`;

const FlagWorld = styled.img`
    width: 20px;
    height: 15px;
    border-radius: 1.5px;
`;

const IncentivizedLeague = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;
    svg {
        width: 18px;
    }
`;

export default TagsDropdown;

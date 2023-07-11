import Tooltip from 'components/Tooltip';
import React from 'react';
import Flag from 'react-flagpack';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import { ReactComponent as ThalesLogo } from 'assets/images/thales-logo-small-white.svg';
import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { INCENTIVIZED_GRAND_SLAM, INCENTIVIZED_LEAGUE } from 'constants/markets';
import { getNetworkId } from 'redux/modules/wallet';
import { TAGS_FLAGS } from 'enums/tags';
import { Network } from 'enums/network';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: Tags;
    setTagFilter: any;
    setTagParam: any;
    openMarketsCountPerTag: any;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({
    open,
    tags,
    tagFilter,
    setTagFilter,
    setTagParam,
    openMarketsCountPerTag,
}) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const networkId = useSelector(getNetworkId);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const tagFilterIds = tagFilter.map((tag) => tag.id);

    return (
        <Container open={open}>
            {tags
                .sort((a, b) => {
                    const numberOfGamesA = Number(!!openMarketsCountPerTag[a.id]);
                    const numberOfGamesB = Number(!!openMarketsCountPerTag[b.id]);

                    const favouriteA = favouriteLeagues.find((league: TagInfo) => league.id == a.id);
                    const isFavouriteA = Number(favouriteA && favouriteA.favourite);

                    const favouriteB = favouriteLeagues.find((league: TagInfo) => league.id == b.id);
                    const isFavouriteB = Number(favouriteB && favouriteB.favourite);

                    const leagueNameA = favouriteA?.label || '';
                    const leagueNameB = favouriteB?.label || '';

                    const leaguePriorityA = favouriteA?.priority || 0;
                    const leaguePriorityB = favouriteB?.priority || 0;

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
                    const favouriteLeague = favouriteLeagues.find((favourite: TagInfo) => favourite.id == tag.id);
                    const isFavourite = favouriteLeague && favouriteLeague.favourite;

                    return (
                        <TagContainer key={tag.id} isMobile={isMobile}>
                            <LeftContainer>
                                <StarIcon
                                    isMobile={isMobile}
                                    onClick={() => {
                                        const newFavourites = favouriteLeagues.map((league: TagInfo) => {
                                            if (league.id == tag.id) {
                                                let newFavouriteFlag;
                                                league.favourite
                                                    ? (newFavouriteFlag = false)
                                                    : (newFavouriteFlag = true);
                                                return {
                                                    ...league,
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
                                            const newTagParam = newTagFilters
                                                .map((tagInfo) => tagInfo.label)
                                                .toString();
                                            setTagParam(newTagParam);
                                        } else {
                                            setTagFilter([...tagFilter, tag]);
                                            setTagParam([...tagFilter, tag].map((tagInfo) => tagInfo.label).toString());
                                        }
                                    }}
                                >
                                    {LeagueFlag(tag.id)}
                                    <Label>{tag.label}</Label>
                                    {INCENTIVIZED_LEAGUE.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_LEAGUE.startDate &&
                                        new Date() < INCENTIVIZED_LEAGUE.endDate && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_LEAGUE.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            rewards:
                                                                networkId !== Network.ArbitrumOne
                                                                    ? INCENTIVIZED_LEAGUE.opRewards
                                                                    : INCENTIVIZED_LEAGUE.thalesRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>
                                                        {networkId !== Network.ArbitrumOne ? (
                                                            <OPLogo />
                                                        ) : (
                                                            <ThalesLogo />
                                                        )}
                                                    </IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                    {INCENTIVIZED_GRAND_SLAM.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_GRAND_SLAM.startDate &&
                                        new Date() < INCENTIVIZED_GRAND_SLAM.endDate && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip-tennis"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_GRAND_SLAM.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            rewards:
                                                                networkId !== Network.ArbitrumOne
                                                                    ? INCENTIVIZED_GRAND_SLAM.opRewards
                                                                    : INCENTIVIZED_GRAND_SLAM.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>
                                                        {networkId !== Network.ArbitrumOne ? (
                                                            <OPLogo />
                                                        ) : (
                                                            <ArbitrumLogo />
                                                        )}
                                                    </IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                </LabelContainer>
                            </LeftContainer>
                            {!!openMarketsCountPerTag[tag.id] && (
                                <Count isMobile={isMobile}>{openMarketsCountPerTag[tag.id]}</Count>
                            )}
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
        case TAGS_FLAGS.J1_LEAGUE:
            return <Flag size="m" code="JP" />;
        case TAGS_FLAGS.IPL:
            return <Flag size="m" code="IN" />;
        case TAGS_FLAGS.EREDIVISIE:
            return <Flag size="m" code="NL" />;
        case TAGS_FLAGS.PRIMEIRA_LIGA:
            return <Flag size="m" code="PT" />;
        case TAGS_FLAGS.T20_BLAST:
            return <Flag size="m" code="GB-UKM" />;
        default:
            return <FlagWorld alt="World flag" src="/world-flag.png" />;
    }
};

const Container = styled.div<{ open: boolean }>`
    display: ${(props) => (!props.open ? 'none' : '')};
`;

const TagContainer = styled(FlexDivRow)<{ isMobile: boolean }>`
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
    margin-right: ${(props) => (props.isMobile ? '30px' : '0px')};
    justify-content: flex-start;
    position: relative;
    align-items: center;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    width: 100%;
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
    margin-left: ${(props) => (props.isMobile ? '35px' : '5px')};
    &.selected,
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
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
    margin-left: 6px;
    svg {
        height: 18px;
    }
`;

const Count = styled(FlexDivCentered)<{ isMobile: boolean }>`
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.quaternary};
    background: ${(props) => (props.isMobile ? props.theme.background.tertiary : props.theme.background.secondary)};
    min-width: 30px;
    height: 18px;
    padding: 0 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

export default TagsDropdown;

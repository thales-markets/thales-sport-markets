import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import Tooltip from 'components/Tooltip';
import { INCENTIVIZED_GRAND_SLAM, INCENTIVIZED_LEAGUE, INCENTIVIZED_NFL_PLAYOFFS } from 'constants/markets';
import { Network } from 'enums/network';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: Tags;
    setTagFilter: any;
    setTagParam: any;
    openMarketsCountPerTag: any;
    showActive: boolean;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({
    open,
    tags,
    tagFilter,
    setTagFilter,
    setTagParam,
    openMarketsCountPerTag,
    showActive,
}) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const networkId = useSelector(getNetworkId);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const tagFilterIds = tagFilter.map((tag) => tag.id);

    return (
        <Container open={open}>
            {tags
                .filter((tag: TagInfo) => (showActive && !!openMarketsCountPerTag[tag.id]) || !showActive)
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
                                    <LeagueFlag alt={tag.id.toString()} src={getLeagueFlagSource(tag.id)} />
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
                                                                networkId !== Network.Arbitrum
                                                                    ? INCENTIVIZED_LEAGUE.opRewards
                                                                    : INCENTIVIZED_LEAGUE.thalesRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>{getNetworkLogo(networkId)}</IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                    {INCENTIVIZED_GRAND_SLAM.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_GRAND_SLAM.startDate &&
                                        new Date() < INCENTIVIZED_GRAND_SLAM.endDate &&
                                        networkId == Network.Arbitrum && (
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
                                                            rewards: INCENTIVIZED_GRAND_SLAM.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>{getNetworkLogo(networkId)}</IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                    {INCENTIVIZED_NFL_PLAYOFFS.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_NFL_PLAYOFFS.startDate &&
                                        new Date() < INCENTIVIZED_NFL_PLAYOFFS.endDate &&
                                        networkId == Network.Arbitrum && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip-nfl-playoffs"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_NFL_PLAYOFFS.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            rewards: INCENTIVIZED_NFL_PLAYOFFS.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>{getNetworkLogo(networkId)}</IncentivizedLeague>
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

const getNetworkLogo = (networkId: number) => {
    switch (networkId) {
        case Network.OptimismMainnet:
            return <OPLogo />;
        case Network.Arbitrum:
            return <ArbitrumLogo />;
        default:
            return <></>;
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

const LeagueFlag = styled.img`
    width: 18px;
    height: 18px;
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

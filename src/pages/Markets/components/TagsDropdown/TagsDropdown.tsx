import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import Tooltip from 'components/Tooltip';
import { INCENTIVIZED_LEAGUE, INCENTIVIZED_MLB, INCENTIVIZED_NHL, INCENTIVIZED_UEFA } from 'constants/markets';
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
import { NetworkId } from 'thales-utils';
import { TagInfo, Tags } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: Tags;
    setTagFilter: any;
    setTagParam: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
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
    showActive,
    showLive,
}) => {
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const networkId = useSelector(getNetworkId);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const tagFilterIds = tagFilter.map((tag) => tag.id);

    return (
        <Container open={open}>
            {tags
                .filter(
                    (tag: TagInfo) =>
                        (showActive && (!!openMarketsCountPerTag[tag.id] || !!liveMarketsCountPerTag[tag.id])) ||
                        !showActive
                )
                .sort((a, b) => {
                    let numberOfGamesA;
                    let numberOfGamesB;
                    if (showLive) {
                        numberOfGamesA = Number(!!liveMarketsCountPerTag[a.id]);
                        numberOfGamesB = Number(!!liveMarketsCountPerTag[b.id]);
                    } else {
                        numberOfGamesA = Number(!!openMarketsCountPerTag[a.id]);
                        numberOfGamesB = Number(!!openMarketsCountPerTag[b.id]);
                    }

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
                                    <Label isMobile={isMobile}>{tag.label}</Label>
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
                                    {INCENTIVIZED_UEFA.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_UEFA.startDate &&
                                        new Date() < INCENTIVIZED_UEFA.endDate && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip-uefa"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_UEFA.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            rewards: INCENTIVIZED_UEFA.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>
                                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                                    </IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                    {INCENTIVIZED_NHL.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_NHL.startDate &&
                                        new Date() < INCENTIVIZED_NHL.endDate && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_NHL.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            league: tag.label,
                                                            rewards: INCENTIVIZED_NHL.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>
                                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                                    </IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                    {INCENTIVIZED_MLB.ids.includes(tag.id) &&
                                        new Date() > INCENTIVIZED_MLB.startDate &&
                                        new Date() < INCENTIVIZED_MLB.endDate && (
                                            <Tooltip
                                                overlay={
                                                    <Trans
                                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                                        components={{
                                                            detailsLink: (
                                                                <a
                                                                    href={INCENTIVIZED_MLB.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                />
                                                            ),
                                                        }}
                                                        values={{
                                                            league: tag.label,
                                                            rewards: INCENTIVIZED_MLB.arbRewards,
                                                        }}
                                                    />
                                                }
                                                component={
                                                    <IncentivizedLeague>
                                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                                    </IncentivizedLeague>
                                                }
                                            ></Tooltip>
                                        )}
                                </LabelContainer>
                            </LeftContainer>
                            {showLive
                                ? !!liveMarketsCountPerTag[tag.id] && (
                                      <Count isMobile={isMobile}>{liveMarketsCountPerTag[tag.id]}</Count>
                                  )
                                : !!openMarketsCountPerTag[tag.id] && (
                                      <Count isMobile={isMobile}>{openMarketsCountPerTag[tag.id]}</Count>
                                  )}
                            {}
                            <StarIcon
                                isMobile={isMobile}
                                onClick={() => {
                                    const newFavourites = favouriteLeagues.map((league: TagInfo) => {
                                        if (league.id == tag.id) {
                                            let newFavouriteFlag;
                                            league.favourite ? (newFavouriteFlag = false) : (newFavouriteFlag = true);
                                            return {
                                                ...league,
                                                favourite: newFavouriteFlag,
                                            };
                                        }
                                        return league;
                                    });
                                    dispatch(setFavouriteLeagues(newFavourites));
                                }}
                                className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                            />
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
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
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
    margin-right: 3px;
`;

export default TagsDropdown;

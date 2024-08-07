import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import Tooltip from 'components/Tooltip';
import {
    INCENTIVIZED_EURO_COPA,
    INCENTIVIZED_LEAGUE,
    INCENTIVIZED_MLB,
    INCENTIVIZED_NHL,
    INCENTIVIZED_WIMBLEDON,
} from 'constants/markets';
import { GOLF_TOURNAMENT_WINNER_TAG, MOTOSPORT_TAGS, TAGS_LIST } from 'constants/tags';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { NetworkId } from 'thales-utils';
import { SportMarkets, TagInfo } from 'types/markets';
import { getLeagueFlagSource } from 'utils/images';
import MarketListCard from '../MarketListCard';

type MarketsList = {
    markets: SportMarkets;
    league: number;
    language: string;
};

const MarketsList: React.FC<MarketsList> = ({ markets, league, language }) => {
    const { t } = useTranslation();
    const [hideLeague, setHideLeague] = useState<boolean>(false);
    const leagueName = TAGS_LIST.find((t: TagInfo) => t.id == league)?.label;
    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const networkId = useSelector(getNetworkId);
    const favouriteLeague = favouriteLeagues.find((favourite: TagInfo) => favourite.id == league);
    const isFavourite = favouriteLeague && favouriteLeague.favourite;

    const sortedMarkets = sortWinnerMarkets(markets, league);

    return (
        <>
            <LeagueCard>
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
                        <ArrowIcon className={`icon-exotic icon-exotic--right`} />
                    ) : (
                        <ArrowIcon down={true} className={`icon-exotic icon-exotic--down`} />
                    )}
                </LeagueInfo>
                {INCENTIVIZED_LEAGUE.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_LEAGUE.startDate &&
                    new Date() < INCENTIVIZED_LEAGUE.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_LEAGUE.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        rewards:
                                            networkId == Network.OptimismMainnet
                                                ? INCENTIVIZED_LEAGUE.opRewards
                                                : networkId == Network.Arbitrum
                                                ? INCENTIVIZED_LEAGUE.arbRewards
                                                : '',
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    {networkId !== Network.Base ? (
                                        <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    ) : (
                                        ''
                                    )}
                                    {getNetworkLogo(networkId)}
                                </IncentivizedLeague>
                            }
                        ></Tooltip>
                    )}
                {INCENTIVIZED_EURO_COPA.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_EURO_COPA.startDate &&
                    new Date() < INCENTIVIZED_EURO_COPA.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip-euro-copa"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_EURO_COPA.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        rewards: INCENTIVIZED_EURO_COPA.opRewards,
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    {getNetworkLogo(NetworkId.OptimismMainnet)}
                                </IncentivizedLeague>
                            }
                        ></Tooltip>
                    )}
                {INCENTIVIZED_WIMBLEDON.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_WIMBLEDON.startDate &&
                    new Date() < INCENTIVIZED_WIMBLEDON.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip-wimbledon"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_WIMBLEDON.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        rewards: INCENTIVIZED_WIMBLEDON.opRewards,
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    {getNetworkLogo(NetworkId.OptimismMainnet)}
                                </IncentivizedLeague>
                            }
                        ></Tooltip>
                    )}
                {INCENTIVIZED_NHL.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_NHL.startDate &&
                    new Date() < INCENTIVIZED_NHL.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_NHL.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        league: leagueName,
                                        rewards: INCENTIVIZED_NHL.arbRewards,
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    {getNetworkLogo(NetworkId.Arbitrum)}
                                </IncentivizedLeague>
                            }
                        ></Tooltip>
                    )}
                {INCENTIVIZED_MLB.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_MLB.startDate &&
                    new Date() < INCENTIVIZED_MLB.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_MLB.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        league: leagueName,
                                        rewards: INCENTIVIZED_MLB.arbRewards,
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    {getNetworkLogo(NetworkId.Arbitrum)}
                                </IncentivizedLeague>
                            }
                        ></Tooltip>
                    )}
                <StarIcon
                    onClick={() => {
                        const newFavourites = favouriteLeagues.map((favourite: TagInfo) => {
                            if (favourite.id == league) {
                                let newFavouriteFlag;
                                favourite.favourite ? (newFavouriteFlag = false) : (newFavouriteFlag = true);
                                return {
                                    ...favourite,
                                    favourite: newFavouriteFlag,
                                };
                            }
                            return favourite;
                        });
                        dispatch(setFavouriteLeagues(newFavourites));
                    }}
                    className={`icon icon--${isFavourite ? 'star-full selected' : 'favourites'} `}
                />
            </LeagueCard>
            <GamesContainer hidden={hideLeague}>
                {sortedMarkets.map((market: any, index: number) => (
                    <MarketListCard language={language} market={market} key={index + 'list'} />
                ))}
            </GamesContainer>
        </>
    );
};

const sortWinnerMarkets = (markets: SportMarkets, leagueId: number) => {
    if (leagueId == GOLF_TOURNAMENT_WINNER_TAG || MOTOSPORT_TAGS.includes(leagueId)) {
        return orderBy(markets, ['maturityDate', 'homeOdds'], ['asc', 'desc']);
    }
    return markets;
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

const LeagueCard = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    width: 100%;
    padding: 10px 12px;
    border-radius: 5px;
    align-items: center;
    background-color: ${(props) => props.theme.background.primary};
    justify-content: space-between;
    padding-right: 40px;
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
    display: ${(props) => (props.hidden ? 'none' : '')};
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
    margin-top: ${(props) => (props.down ? '5px' : '')};
    margin-bottom: ${(props) => (props.down ? '' : '2px')};
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
    &.selected,
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

const IncentivizedLeague = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    svg {
        height: 21px;
    }
`;

const IncentivizedTitle = styled.span`
    font-size: 13px;
    padding-right: 5px;
    text-align: right;
`;

export default MarketsList;

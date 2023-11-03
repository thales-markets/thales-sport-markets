import { GOLF_TOURNAMENT_WINNER_TAG, MOTOSPORT_TAGS, TAGS_LIST } from 'constants/tags';
import React, { useState } from 'react';
import Flag from 'react-flagpack';
import { useDispatch, useSelector } from 'react-redux';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { SportMarkets, TagInfo } from 'types/markets';
import MarketListCard from '../MarketListCard';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import Tooltip from 'components/Tooltip';
import { Trans, useTranslation } from 'react-i18next';
import { INCENTIVIZED_GRAND_SLAM, INCENTIVIZED_LEAGUE } from 'constants/markets';
import { getNetworkId } from 'redux/modules/wallet';
import { Network } from 'enums/network';
import { TAGS_FLAGS } from 'enums/tags';
import { orderBy } from 'lodash';

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
                    {LeagueFlag(Number(league))}
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
                                                ? INCENTIVIZED_LEAGUE.thalesRewards
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
                {INCENTIVIZED_GRAND_SLAM.ids.includes(Number(league)) &&
                    new Date() > INCENTIVIZED_GRAND_SLAM.startDate &&
                    new Date() < INCENTIVIZED_GRAND_SLAM.endDate && (
                        <Tooltip
                            overlay={
                                <Trans
                                    i18nKey="markets.incentivized-tooltip-tennis"
                                    components={{
                                        detailsLink: (
                                            <a href={INCENTIVIZED_GRAND_SLAM.link} target="_blank" rel="noreferrer" />
                                        ),
                                    }}
                                    values={{
                                        rewards:
                                            networkId == Network.OptimismMainnet
                                                ? INCENTIVIZED_LEAGUE.opRewards
                                                : networkId == Network.Arbitrum
                                                ? INCENTIVIZED_LEAGUE.thalesRewards
                                                : '',
                                    }}
                                />
                            }
                            component={
                                <IncentivizedLeague>
                                    <IncentivizedTitle>{t('markets.incentivized-markets')}</IncentivizedTitle>
                                    {getNetworkLogo(networkId)}
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
                    className={`icon icon--${isFavourite ? 'star-full selected' : 'star-empty'} `}
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

const LeagueFlag = (tagId: number | any) => {
    switch (tagId) {
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NFL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.MLB:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NBA:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NHL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.WNBA:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.MLS:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.EPL:
            return <Flag size="l" code="GB-ENG" />;
        case TAGS_FLAGS.LIGUE_ONE:
            return <Flag size="l" code="FR" />;
        case TAGS_FLAGS.BUNDESLIGA:
            return <Flag size="l" code="DE" />;
        case TAGS_FLAGS.LA_LIGA:
            return <Flag size="l" code="ES" />;
        case TAGS_FLAGS.SERIE_A:
            return <Flag size="l" code="IT" />;
        case TAGS_FLAGS.J1_LEAGUE:
            return <Flag size="l" code="JP" />;
        case TAGS_FLAGS.IPL:
            return <Flag size="l" code="IN" />;
        case TAGS_FLAGS.EREDIVISIE:
            return <Flag size="l" code="NL" />;
        case TAGS_FLAGS.PRIMEIRA_LIGA:
            return <Flag size="l" code="PT" />;
        case TAGS_FLAGS.T20_BLAST:
            return <Flag size="l" code="GB-UKM" />;
        case TAGS_FLAGS.SAUDI_PROFESSIONAL_LEAGUE:
            return <Flag size="l" code="SA" />;
        case TAGS_FLAGS.BRAZIL_1:
            return <Flag size="l" code="BR" />;
        default:
            return <FlagWorld alt="World flag" src="/world-flag.png" />;
    }
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

const FlagWorld = styled.img`
    width: 32px;
    height: 24px;
    border-radius: 1.5px;
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

import MatchLogosV2 from 'components/MatchLogosV2';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { PLAYER_PROPS_SPECIAL_SPORTS } from 'constants/sports';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getMarketTypeFilter, getMarketTypeGroupFilter, getSelectedMarket } from 'redux/modules/market';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { getPlayerPropsMarketsOverviewLength, getSpecializedPropForMarket, getTeamNameV2 } from 'utils/marketsV2';
import MarketListCardV2 from '../MarketListCard';
import {
    ArrowIcon,
    Fire,
    FireContainer,
    FireText,
    GameOfLabel,
    MatchTeamsLabel,
    MatchTimeLabel,
    MatchTimeLabelContainer,
    PlayerPropsHeader,
    StickyContainer,
} from './styled-components';

const GameList: React.FC<{ markets: SportMarket[]; language: string }> = ({ markets, language }) => {
    const { t } = useTranslation();

    const isAppReady = useSelector(getIsAppReady);
    const selectedMarket = useSelector(getSelectedMarket);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);

    const parentMarket = { ...markets[0], isPlayerPropsMarket: false, isOneSideMarket: false };

    const [hideMarkets, setHidemarkets] = useState<boolean>(false);

    const gameMultipliersQuery = useGameMultipliersQuery({
        enabled: isAppReady,
    });

    const overdropGameMultiplier = useMemo(() => {
        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];
        return gameMultipliers.find((multiplier) => multiplier.gameId === parentMarket.gameId);
    }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, parentMarket.gameId]);

    const sortedMarkets = useMemo(() => {
        return [...markets].sort((a, b) => {
            const aSpecialProp = getSpecializedPropForMarket(a);
            const bSpecialProp = getSpecializedPropForMarket(b);
            const aLength = aSpecialProp ? 3 : getPlayerPropsMarketsOverviewLength(a);
            const bLength = bSpecialProp ? 3 : getPlayerPropsMarketsOverviewLength(b);

            return aLength > bLength
                ? -1
                : aLength < bLength
                ? 1
                : aSpecialProp === bSpecialProp
                ? 0
                : a.childMarkets[0].typeId === b.childMarkets[0].typeId
                ? 0
                : 1;
        });
    }, [markets]);

    return (
        <>
            <PlayerPropsHeader
                onClick={() => setHidemarkets(!hideMarkets)}
                marketSelected={!!selectedMarket}
                collapsed={hideMarkets}
            >
                <StickyContainer>
                    <FlexDivRowCentered gap={20}>
                        <MatchLogosV2
                            market={parentMarket}
                            width={!!selectedMarket ? '30px' : '45px'}
                            height="30px"
                            logoWidth={!!selectedMarket ? '24px' : '34px'}
                            logoHeight={!!selectedMarket ? '24px' : '34px'}
                        />
                        <FlexDivColumn gap={3}>
                            <Tooltip
                                overlay={
                                    <>
                                        {t(`markets.market-card.starts-in`)}:{' '}
                                        <TimeRemaining end={markets[0].maturityDate} fontSize={11} />
                                    </>
                                }
                                component={
                                    <MatchTimeLabelContainer gap={5}>
                                        <MatchTimeLabel marketSelected={!!selectedMarket}>
                                            {formatShortDateWithTime(new Date(markets[0].maturityDate))}{' '}
                                        </MatchTimeLabel>
                                    </MatchTimeLabelContainer>
                                }
                            />
                            {!selectedMarket && (
                                <GameOfLabel>
                                    {!!overdropGameMultiplier && (
                                        <FireContainer gap={2}>
                                            <Fire className={'icon icon--fire'} />
                                            <FireText>{`+${overdropGameMultiplier.multiplier}% XP`}</FireText>
                                        </FireContainer>
                                    )}
                                    {overdropGameMultiplier && `Game of the ${overdropGameMultiplier.type}`}
                                </GameOfLabel>
                            )}
                            <MatchTeamsLabel marketSelected={!!selectedMarket}>
                                <span>{getTeamNameV2(parentMarket, 0)}</span>
                                {!selectedMarket && <span>-</span>}
                                <span>{getTeamNameV2(parentMarket, 1)}</span>
                            </MatchTeamsLabel>
                        </FlexDivColumn>
                    </FlexDivRowCentered>
                    {hideMarkets ? (
                        <ArrowIcon className={`icon icon--caret-right`} />
                    ) : (
                        <ArrowIcon down={true} className={`icon icon--caret-down`} />
                    )}
                </StickyContainer>
            </PlayerPropsHeader>
            {!hideMarkets &&
                sortedMarkets.map((market: SportMarket, index: number) => (
                    <MarketListCardV2
                        language={language}
                        market={market}
                        key={index + 'list'}
                        oddsTitlesHidden={
                            !(
                                index === 0 ||
                                ((sortedMarkets[index - 1].childMarkets[0]?.typeId !== market.childMarkets[0]?.typeId ||
                                    sortedMarkets[index - 1].childMarkets[1]?.typeId !==
                                        market.childMarkets[1]?.typeId ||
                                    sortedMarkets[index - 1].childMarkets[2]?.typeId !==
                                        market.childMarkets[2]?.typeId) &&
                                    PLAYER_PROPS_SPECIAL_SPORTS.includes(market.sport) &&
                                    getSpecializedPropForMarket(sortedMarkets[index - 1]) !==
                                        getSpecializedPropForMarket(market) &&
                                    !marketTypeGroupFilter)
                            ) || !!marketTypeFilter
                        }
                        floatingOddsTitles={
                            (index === 0 ||
                                ((sortedMarkets[index - 1].childMarkets[0]?.typeId !== market.childMarkets[0]?.typeId ||
                                    sortedMarkets[index - 1].childMarkets[1]?.typeId !==
                                        market.childMarkets[1]?.typeId ||
                                    sortedMarkets[index - 1].childMarkets[2]?.typeId !==
                                        market.childMarkets[2]?.typeId) &&
                                    PLAYER_PROPS_SPECIAL_SPORTS.includes(market.sport) &&
                                    getSpecializedPropForMarket(sortedMarkets[index - 1]) !==
                                        getSpecializedPropForMarket(market) &&
                                    !marketTypeGroupFilter)) &&
                            !marketTypeFilter
                        }
                    />
                ))}
        </>
    );
    {
    }
};

export default GameList;

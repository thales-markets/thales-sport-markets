import Button from 'components/Button';
import Scroll from 'components/Scroll';
import { MarketTypeGroupsBySport, PLAYER_PROPS_MARKET_TYPES } from 'constants/marketTypes';
import { SportFilter } from 'enums/markets';
import { MarketType } from 'enums/marketTypes';
import { League } from 'enums/sports';
import { t } from 'i18next';
import { groupBy } from 'lodash';
import React, { useMemo, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    setMarketTypeGroupFilter,
} from 'redux/modules/market';
import { useTheme } from 'styled-components';
import { SportMarket } from 'types/markets';
import { isOddValid } from 'utils/marketsV2';
import { ThemeInterface } from '../../../../types/ui';
import { isFuturesMarket } from '../../../../utils/markets';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import { NoMarketsContainer, NoMarketsLabel, Wrapper } from './styled-components';

type SelectedMarketProps = {
    market: SportMarket;
};

const SelectedMarket: React.FC<SelectedMarketProps> = ({ market }) => {
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();
    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const isMobile = useSelector(getIsMobile);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);

    const playerName = useMemo(() => selectedMarket?.playerName, [selectedMarket?.playerName]);

    // hack to rerender scroll due to bug in scroll component when scroll should change state (become hidden/visible)
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
    const refreshScroll = () => {
        if (ignored >= 0) {
            forceUpdate();
        }
    };

    const marketTypesFilter = useMemo(() => {
        const marketTypeGroupFilters = marketTypeGroupFilter
            ? MarketTypeGroupsBySport[market.sport][marketTypeGroupFilter] || []
            : [];
        const playerPropsFilters = sportFilter === SportFilter.PlayerProps ? PLAYER_PROPS_MARKET_TYPES : [];

        return marketTypeGroupFilters.length ? marketTypeGroupFilters : playerPropsFilters;
    }, [market.sport, marketTypeGroupFilter, sportFilter]);

    const groupedChildMarkets = useMemo(
        () =>
            groupBy(
                market.childMarkets.filter(
                    (childMarket) =>
                        !marketTypesFilter.length ||
                        (marketTypesFilter.includes(childMarket.typeId) &&
                            (!playerName || childMarket.playerProps.playerName === playerName))
                ),
                (childMarket: SportMarket) => childMarket.typeId
            ),
        [market.childMarkets, marketTypesFilter, playerName]
    );

    const numberOfMarkets = useMemo(() => {
        let num =
            !marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER) || isFuturesMarket(market.typeId)
                ? 1
                : 0;
        Object.keys(groupedChildMarkets).forEach((key) => {
            const typeId = Number(key);
            const childMarkets = groupedChildMarkets[typeId];
            num += childMarkets.length;
        });
        return num;
    }, [groupedChildMarkets, market.typeId, marketTypesFilter]);

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameOpen && !areOddsValid && !areChildMarketsOddsValid;

    return (
        <Scroll height={`calc(100vh - ${isMobile ? 0 : market.leagueId === League.US_ELECTION ? 280 : 194}px)`}>
            <Wrapper hideGame={hideGame}>
                {numberOfMarkets === 0 ? (
                    <NoMarketsContainer>
                        <NoMarketsLabel>{`${t('market.no-markets-found')} ${marketTypeGroupFilter}`}</NoMarketsLabel>
                        <Button
                            onClick={() => dispatch(setMarketTypeGroupFilter(undefined))}
                            backgroundColor={theme.button.background.secondary}
                            textColor={theme.button.textColor.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            height="24px"
                            fontSize="12px"
                        >
                            {t('market.view-all-markets')}
                        </Button>
                    </NoMarketsContainer>
                ) : (
                    <>
                        {(!marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER)) && (
                            <PositionsV2
                                markets={[market]}
                                marketType={market.typeId}
                                isGameOpen={isGameOpen}
                                onAccordionClick={refreshScroll}
                                hidePlayerName={sportFilter === SportFilter.PlayerProps}
                                alignHeader={sportFilter === SportFilter.PlayerProps}
                            />
                        )}
                        {Object.keys(groupedChildMarkets).map((key, index) => {
                            const typeId = Number(key);
                            const childMarkets = groupedChildMarkets[typeId];
                            return (
                                <PositionsV2
                                    key={index}
                                    markets={childMarkets}
                                    marketType={typeId}
                                    isGameOpen={isGameOpen}
                                    onAccordionClick={refreshScroll}
                                    hidePlayerName={sportFilter === SportFilter.PlayerProps}
                                    alignHeader={sportFilter === SportFilter.PlayerProps}
                                />
                            );
                        })}
                    </>
                )}
            </Wrapper>
        </Scroll>
    );
};

export default SelectedMarket;

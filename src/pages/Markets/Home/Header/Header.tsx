import {
    MarketTypeGroupsBySport,
    MarketTypePlayerPropsGroupsBySport,
    MarketTypesBySportFilter,
} from 'constants/marketTypes';
import { SportFilter } from 'enums/markets';
import { MarketTypeGroup } from 'enums/marketTypes';
import { uniq } from 'lodash';
import { isPlayerPropsMarket, MarketType, Sport } from 'overtime-utils';
import React, { useContext, useMemo } from 'react';
import { publicApiType, ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getMarketTypeFilter,
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    setMarketTypeFilter,
    setMarketTypeGroupFilter,
} from 'redux/modules/market';
import { SportMarket } from 'types/markets';
import { getMarketTypeName } from 'utils/markets';
import { ArrowIcon, Container, FilterIcon, MarketTypeButton, NoScrollbarContainer } from './styled-components';

type HeaderProps = {
    allMarkets?: SportMarket[];
    availableMarketTypes?: MarketType[];
    market?: SportMarket;
};

const LeftArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isFirstItemVisible = visibility.useIsVisible('first', true);
    const isLastItemVisible = visibility.useIsVisible('last', false);

    return (
        <ArrowIcon
            onClick={() => visibility.scrollPrev()}
            className="icon icon--arrow-down"
            hide={isFirstItemVisible}
            hideBoth={isFirstItemVisible && isLastItemVisible}
            isLeft
        ></ArrowIcon>
    );
};

const RightArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isLastItemVisible = visibility.useIsVisible('last', false);
    const isFirstItemVisible = visibility.useIsVisible('first', true);

    return (
        <ArrowIcon
            className="icon icon--arrow-down"
            onClick={() => visibility.scrollNext()}
            hide={isLastItemVisible}
            hideBoth={isFirstItemVisible && isLastItemVisible}
        ></ArrowIcon>
    );
};

const Header: React.FC<HeaderProps> = ({ availableMarketTypes, market, allMarkets }) => {
    const dispatch = useDispatch();

    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);
    const isMobile = useSelector(getIsMobile);

    const isPlayerPropsFilter = useMemo(() => sportFilter == SportFilter.PlayerProps, [sportFilter]);
    const marketToCheck = useMemo(() => market || selectedMarket, [market, selectedMarket]);

    const marketTypes = useMemo(() => {
        if (marketToCheck) {
            let marketTypeGroups = Object.keys(MarketTypeGroupsBySport[marketToCheck.sport] || {}).map(
                (key) => key as MarketTypeGroup
            );
            if (market) {
                let marketToCheckAvailableMarketTypes: MarketType[] = [];

                if (!isPlayerPropsFilter) {
                    marketToCheckAvailableMarketTypes = [market.typeId];
                }

                market.childMarkets.forEach((childMarket: SportMarket) => {
                    if (!isPlayerPropsFilter || isPlayerPropsMarket(childMarket.typeId)) {
                        marketToCheckAvailableMarketTypes.push(childMarket.typeId);
                    }
                });
                marketToCheckAvailableMarketTypes = uniq(marketToCheckAvailableMarketTypes);

                marketTypeGroups = marketTypeGroups.filter((group: MarketTypeGroup) => {
                    const marketTypes = (MarketTypeGroupsBySport[marketToCheck.sport] || {})[group];

                    return marketTypes
                        ? marketTypes.some((marketType: MarketType) =>
                              marketToCheckAvailableMarketTypes.includes(marketType)
                          )
                        : false;
                });
            }

            return marketTypeGroups;
        } else {
            const availableSports = allMarkets?.reduce((acc: string[], market: SportMarket) => {
                if (!acc.includes(market.sport)) {
                    acc.push(market.sport);
                }
                return acc;
            }, []);

            let marketTypeGroups: any[] = [];

            if (isPlayerPropsFilter) {
                availableSports?.forEach((sport) => {
                    const marketTypes = Object.keys(MarketTypePlayerPropsGroupsBySport[sport as Sport] || {}).map(
                        (key) => key as MarketTypeGroup
                    );
                    const sportMarketTypeGroups = marketTypes.filter((group: MarketTypeGroup) => {
                        const marketTypes = (MarketTypePlayerPropsGroupsBySport[sport as Sport] || {})[group];

                        return marketTypes && availableMarketTypes
                            ? marketTypes.some((marketType: MarketType) => availableMarketTypes.includes(marketType))
                            : false;
                    });
                    marketTypeGroups = [...marketTypeGroups, ...sportMarketTypeGroups];
                });

                if ((availableSports?.length || 0) > 1) {
                    return marketTypeGroups;
                }
            }

            return availableMarketTypes
                ? [
                      ...(isMobile ? [] : marketTypeGroups),
                      ...MarketTypesBySportFilter[sportFilter].filter((marketType) =>
                          availableMarketTypes.includes(marketType)
                      ),
                  ]
                : [];
        }
    }, [marketToCheck, market, availableMarketTypes, sportFilter, allMarkets, isPlayerPropsFilter, isMobile]);

    return (
        <Container>
            <FilterIcon className="icon icon--filters2" />
            <NoScrollbarContainer>
                <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                    {marketTypes.map((marketType, index) => {
                        if (marketToCheck) {
                            return (
                                <MarketTypeButton
                                    onClick={() =>
                                        marketTypeGroupFilter === marketType
                                            ? dispatch(setMarketTypeGroupFilter(undefined))
                                            : dispatch(setMarketTypeGroupFilter(marketType as MarketTypeGroup))
                                    }
                                    selected={marketTypeGroupFilter === marketType}
                                    key={`${marketType}${index}`}
                                    itemID={`${marketType}`}
                                >
                                    {marketType}
                                </MarketTypeButton>
                            );
                        } else if (isPlayerPropsFilter) {
                            return (
                                <MarketTypeButton
                                    onClick={() => {
                                        if (typeof marketType === 'number') {
                                            if (marketTypeFilter === marketType) {
                                                dispatch(setMarketTypeFilter(undefined));
                                            } else {
                                                dispatch(setMarketTypeGroupFilter(undefined));
                                                dispatch(setMarketTypeFilter(marketType as MarketType));
                                            }
                                        } else {
                                            if (marketTypeGroupFilter === marketType) {
                                                dispatch(setMarketTypeGroupFilter(undefined));
                                            } else {
                                                dispatch(setMarketTypeFilter(undefined));
                                                dispatch(setMarketTypeGroupFilter(marketType as MarketTypeGroup));
                                            }
                                        }
                                    }}
                                    selected={marketTypeGroupFilter === marketType || marketTypeFilter === marketType}
                                    key={`${marketType}${index}`}
                                    itemID={`${marketType}`}
                                >
                                    {typeof marketType === 'number'
                                        ? getMarketTypeName(marketType as MarketType, true)
                                        : marketType}
                                </MarketTypeButton>
                            );
                        }
                        {
                            return (
                                <MarketTypeButton
                                    onClick={() =>
                                        marketTypeFilter === marketType
                                            ? dispatch(setMarketTypeFilter(undefined))
                                            : dispatch(setMarketTypeFilter(marketType as MarketType))
                                    }
                                    selected={marketTypeFilter === marketType}
                                    key={`${marketType}${index}`}
                                    itemID={`${marketType}`}
                                >
                                    {getMarketTypeName(marketType as MarketType)}
                                </MarketTypeButton>
                            );
                        }
                    })}
                </ScrollMenu>
            </NoScrollbarContainer>
        </Container>
    );
};

export default Header;

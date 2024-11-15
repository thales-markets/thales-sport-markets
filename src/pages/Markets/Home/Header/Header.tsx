import Tooltip from 'components/Tooltip';
import { MarketTypeGroupsBySport, MarketTypesBySportFilter } from 'constants/marketTypes';
import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import { uniq } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { ScrollMenu, VisibilityContext, publicApiType } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsThreeWayView,
    getMarketTypeFilter,
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    setIsThreeWayView,
    setMarketTypeFilter,
    setMarketTypeGroupFilter,
} from 'redux/modules/market';
import { SportMarket } from 'types/markets';
import { getMarketTypeName } from 'utils/markets';
import {
    ArrowIcon,
    Container,
    FilterIcon,
    MarketTypeButton,
    NoScrollbarContainer,
    SwitchContainer,
    ThreeWayIcon,
} from './styled-components';

type HeaderProps = {
    availableMarketTypes?: MarketType[];
    market?: SportMarket;
    hideSwitch?: boolean;
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

const Header: React.FC<HeaderProps> = ({ availableMarketTypes, market, hideSwitch }) => {
    const dispatch = useDispatch();
    const isThreeWayView = useSelector(getIsThreeWayView);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);

    const marketToCheck = market || selectedMarket;

    const marketTypes = useMemo(() => {
        if (marketToCheck) {
            let marketTypeGroups = Object.keys(MarketTypeGroupsBySport[marketToCheck.sport] || {}).map(
                (key) => key as MarketTypeGroup
            );
            if (market) {
                let marketToCheckAvailableMarketTypes = [market.typeId];

                market.childMarkets.forEach((childMarket: SportMarket) => {
                    marketToCheckAvailableMarketTypes.push(childMarket.typeId);
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
            return availableMarketTypes
                ? MarketTypesBySportFilter[sportFilter].filter((marketType) =>
                      availableMarketTypes.includes(marketType)
                  )
                : [];
        }
    }, [marketToCheck, market, availableMarketTypes, sportFilter]);

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
                        } else {
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
            {!hideSwitch && !selectedMarket && marketTypeFilter === undefined && (
                <SwitchContainer>
                    <Tooltip
                        overlay={isThreeWayView ? 'Switch to standard view' : 'Switch to three column view'}
                        component={
                            <ThreeWayIcon
                                onClick={() => {
                                    if (!selectedMarket && marketTypeFilter === undefined) {
                                        dispatch(setIsThreeWayView(!isThreeWayView));
                                    }
                                }}
                                fontSize={isThreeWayView ? 20 : 28}
                                className={`icon ${isThreeWayView ? 'icon--list' : 'icon--three-column'}`}
                                disabled={!!selectedMarket || marketTypeFilter !== undefined}
                            />
                        }
                    />
                </SwitchContainer>
            )}
        </Container>
    );
};

export default Header;

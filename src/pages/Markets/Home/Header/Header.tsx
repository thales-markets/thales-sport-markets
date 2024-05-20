import { MARKET_TYPES_BY_SPORT, MARKET_TYPE_GROUPS_BY_SPORT } from 'constants/marketTypes';
import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import React, { useContext, useMemo } from 'react';
import { ScrollMenu, VisibilityContext, publicApiType } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsThreeWayView,
    getMarketTypeFilter,
    getSelectedMarket,
    getSportFilter,
    setIsThreeWayView,
    setMarketTypeFilter,
} from 'redux/modules/market';
import { getMarketTypeName } from '../../../../utils/markets';
import { ArrowIcon, Container, MarketTypeButton, NoScrollbarContainer, ThreeWayIcon } from './styled-components';

type HeaderProps = {
    availableMarketTypes: MarketType[];
};

const LeftArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isFirstItemVisible = visibility.useIsVisible('first', true);
    const isLastItemVisible = visibility.useIsVisible('last', false);

    // const onClick = () => visibility.scrollToItem(visibility.getPrevElement(), 'smooth', 'start');

    return (
        <ArrowIcon
            onClick={() => visibility.scrollPrev()}
            className="icon icon--arrow"
            hide={isFirstItemVisible}
            hideBoth={isFirstItemVisible && isLastItemVisible}
            flip
        ></ArrowIcon>
    );
};

const RightArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isFirstItemVisible = visibility.useIsVisible('first', true);
    const isLastItemVisible = visibility.useIsVisible('last', false);

    // const onClick = () => visibility.scrollToItem(visibility.getNextElement(), 'smooth', 'end');

    return (
        <ArrowIcon
            className="icon icon--arrow"
            onClick={() => visibility.scrollNext()}
            hide={isLastItemVisible}
            hideBoth={isFirstItemVisible && isLastItemVisible}
        ></ArrowIcon>
    );
};

const Header: React.FC<HeaderProps> = ({ availableMarketTypes }) => {
    const dispatch = useDispatch();
    const isThreeWayView = useSelector(getIsThreeWayView);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);

    const marketTypes = useMemo(() => {
        if (selectedMarket) {
            return Object.keys(MARKET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport] || {});
        } else {
            return availableMarketTypes.filter((marketType) => MARKET_TYPES_BY_SPORT[sportFilter].includes(marketType));
        }
    }, [sportFilter, availableMarketTypes, selectedMarket]);

    return (
        <Container>
            <NoScrollbarContainer>
                <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                    {marketTypes.map((marketType, index) => {
                        if (typeof marketType === 'string') {
                            if (!selectedMarket) {
                                return <></>;
                            }
                            return (
                                <MarketTypeButton
                                    onClick={() =>
                                        JSON.stringify(
                                            MARKET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][
                                                marketType as MarketTypeGroup
                                            ] || []
                                        ) === JSON.stringify(marketTypeFilter)
                                            ? dispatch(setMarketTypeFilter([]))
                                            : dispatch(
                                                  setMarketTypeFilter(
                                                      MARKET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][
                                                          marketType as MarketTypeGroup
                                                      ] || []
                                                  )
                                              )
                                    }
                                    selected={
                                        JSON.stringify(
                                            MARKET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][
                                                marketType as MarketTypeGroup
                                            ] || []
                                        ) === JSON.stringify(marketTypeFilter)
                                    }
                                    key={`${marketType}${index}`}
                                    itemID={marketType}
                                >
                                    {marketType}
                                </MarketTypeButton>
                            );
                        } else {
                            return (
                                <MarketTypeButton
                                    onClick={() =>
                                        marketTypeFilter.includes(marketType)
                                            ? dispatch(setMarketTypeFilter([]))
                                            : dispatch(setMarketTypeFilter([marketType]))
                                    }
                                    selected={marketTypeFilter.includes(marketType)}
                                    key={`${marketType}${index}`}
                                    itemID={`${marketType}`}
                                >
                                    {getMarketTypeName(marketType)}
                                </MarketTypeButton>
                            );
                        }
                    })}
                </ScrollMenu>
            </NoScrollbarContainer>
            <ThreeWayIcon
                onClick={() => dispatch(setIsThreeWayView(!isThreeWayView))}
                className={`icon ${isThreeWayView ? 'icon--list' : 'icon--grid'}`}
            />
        </Container>
    );
};

export default Header;

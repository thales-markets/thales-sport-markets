import { MARKET_TYPES_BY_SPORT, MARKET_TYPE_GROUPS_BY_SPORT } from 'constants/marketTypes';
import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsThreeWayView,
    getMarketTypeFilter,
    getSelectedMarket,
    getSportFilter,
    setIsThreeWayView,
    setMarketTypeFilter,
} from 'redux/modules/market';
import { getMarketTypeName } from 'utils/markets';
import { ArrowIcon, Container, MarketTypeButton, MarketTypesContainer, ThreeWayIcon } from './styled-components';

type HeaderProps = {
    availableMarketTypes: MarketType[];
};

const SCROLL_AMOUNT = 200;

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
            <ArrowIcon
                flip
                className="icon icon--arrow"
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: -SCROLL_AMOUNT,
                        behavior: 'smooth',
                    });
                }}
            />
            <MarketTypesContainer id="bet-types-container">
                {marketTypes.map((marketType) => {
                    if (typeof marketType === 'string') {
                        if (!selectedMarket) {
                            return;
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
                                key={marketType}
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
                                key={marketType}
                            >
                                {getMarketTypeName(marketType)}
                            </MarketTypeButton>
                        );
                    }
                })}
            </MarketTypesContainer>
            <ArrowIcon
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: SCROLL_AMOUNT,
                        behavior: 'smooth',
                    });
                }}
                className="icon icon--arrow"
            />
            <ThreeWayIcon
                onClick={() => dispatch(setIsThreeWayView(!isThreeWayView))}
                className={`icon ${isThreeWayView ? 'icon--list' : 'icon--grid'}`}
            />
        </Container>
    );
};

export default Header;

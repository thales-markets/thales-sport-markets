import { BET_TYPES_BY_SPORT, BET_TYPE_GROUPS_BY_SPORT, BetTypeNameMap } from 'constants/tags';
import { BetType, BetTypeGroup } from 'enums/markets';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getBetTypeFilter,
    getIsThreeWayView,
    getSelectedMarket,
    getSportFilter,
    setBetTypeFilter,
    setIsThreeWayView,
} from 'redux/modules/market';
import { ArrowIcon, BetTypeButton, BetTypesContainer, Container, ThreeWayIcon } from './styled-components';

type HeaderProps = {
    availableBetTypes: BetType[];
};

const SCROLL_AMOUNT = 200;

const Header: React.FC<HeaderProps> = ({ availableBetTypes }) => {
    const dispatch = useDispatch();
    const isThreeWayView = useSelector(getIsThreeWayView);
    const betTypeFilter = useSelector(getBetTypeFilter);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);

    const betTypes = useMemo(() => {
        if (selectedMarket) {
            return Object.keys(BET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport] || {});
        } else {
            return availableBetTypes.filter((betType) => BET_TYPES_BY_SPORT[sportFilter].includes(betType));
        }
    }, [sportFilter, availableBetTypes, selectedMarket]);

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
            <BetTypesContainer id="bet-types-container">
                {betTypes.map((betType) => {
                    if (typeof betType === 'string') {
                        if (!selectedMarket) {
                            return;
                        }
                        return (
                            <BetTypeButton
                                onClick={() =>
                                    JSON.stringify(
                                        BET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][betType as BetTypeGroup] || []
                                    ) === JSON.stringify(betTypeFilter)
                                        ? dispatch(setBetTypeFilter([]))
                                        : dispatch(
                                              setBetTypeFilter(
                                                  BET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][
                                                      betType as BetTypeGroup
                                                  ] || []
                                              )
                                          )
                                }
                                selected={
                                    JSON.stringify(
                                        BET_TYPE_GROUPS_BY_SPORT[selectedMarket.sport][betType as BetTypeGroup] || []
                                    ) === JSON.stringify(betTypeFilter)
                                }
                                key={betType}
                            >
                                {betType}
                            </BetTypeButton>
                        );
                    } else {
                        return (
                            <BetTypeButton
                                onClick={() =>
                                    betTypeFilter.includes(betType)
                                        ? dispatch(setBetTypeFilter([]))
                                        : dispatch(setBetTypeFilter([betType]))
                                }
                                selected={betTypeFilter.includes(betType)}
                                key={betType}
                            >
                                {BetTypeNameMap[betType]}
                            </BetTypeButton>
                        );
                    }
                })}
            </BetTypesContainer>
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
                className={`icon ${isThreeWayView ? 'icon--profile' : 'icon--filters'}`}
            />
        </Container>
    );
};

export default Header;

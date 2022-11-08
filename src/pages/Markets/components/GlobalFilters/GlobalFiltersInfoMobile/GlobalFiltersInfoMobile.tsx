import burger from 'assets/images/burger.svg';
import Dropdown from 'components/Dropdown';
import { GlobalFiltersEnum, OddsType, ODDS_TYPES, SportFilterEnum } from 'constants/markets';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { getQueryStringVal } from 'utils/useQueryParams';
import { Circle, Filters, FilterTypeContainer, GlobalFilter, Label, TimeFilterContainer } from '../GlobalFilters';

type GlobalFiltersInfoMobileProps = {
    globalFilter: GlobalFiltersEnum;
    dateFilter: Date | number;
    sportFilter: SportFilterEnum;
    showBurger: boolean;
    setShowBurger: (value: boolean) => void;
};

const GlobalFiltersInfoMobile: React.FC<GlobalFiltersInfoMobileProps> = ({
    globalFilter,
    dateFilter,
    sportFilter,
    showBurger,
    setShowBurger,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [selectedPeriod, setSelectedPeriod] = useState<number>(0);

    const selectedOddsType = useSelector(getOddsType);
    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    useEffect(() => {
        if (typeof dateFilter == 'number') {
            const dateParam = getQueryStringVal('date');
            const timeFilter = dateParam?.split('h')[0];
            switch (timeFilter) {
                case '1':
                    setSelectedPeriod(1);
                    break;
                case '3':
                    setSelectedPeriod(3);
                    break;
                case '12':
                    setSelectedPeriod(12);
                    break;
                case '72':
                    setSelectedPeriod(72);
                    break;
                default:
                    setSelectedPeriod(0);
                    break;
            }
        } else {
            setSelectedPeriod(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFilter]);

    useEffect(() => {
        setSelectedPeriod(0);
    }, [globalFilter]);

    useEffect(() => {
        if (sportFilter == SportFilterEnum.All) {
            setSelectedPeriod(0);
        }
    }, [sportFilter]);

    return (
        <Container>
            <Wrapper>
                <FilterTypeContainer>
                    <BurgerMenu
                        src={burger}
                        onClick={() => {
                            setShowBurger(!showBurger);
                        }}
                    />
                    <GlobalFilterLabel selected={true}>
                        {t(`market.filter-label.global.${globalFilter.toLowerCase()}`)}
                    </GlobalFilterLabel>
                </FilterTypeContainer>
                <FilterTypeContainer>
                    {selectedPeriod != 0 && globalFilter == GlobalFiltersEnum.OpenMarkets && (
                        <TimeFilterContainer selected={true}>
                            <Circle />
                            <Label>{selectedPeriod > 12 ? `3d` : `${selectedPeriod}h`}</Label>
                        </TimeFilterContainer>
                    )}
                </FilterTypeContainer>
                <Dropdown<OddsType> list={ODDS_TYPES} selectedItem={selectedOddsType} onSelect={setSelectedOddsType} />
            </Wrapper>
        </Container>
    );
};

const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 750px;
    margin: 10px 0px;
`;

const Wrapper = styled(Filters)`
    justify-content: space-between;
    margin: 0px 5px;
    @media (max-width: 950px) {
        font-size: 11px;
        line-height: 11px;
    }
`;

const BurgerMenu = styled.img`
    display: flex;
    height: 10px;
    margin-right: 5px;
`;

const GlobalFilterLabel = styled(GlobalFilter)`
    width: max-content;
`;

export default GlobalFiltersInfoMobile;

import Dropdown from 'components/Dropdown';
import { ODDS_TYPES } from 'constants/markets';
import { GlobalFiltersEnum, OddsType, SportFilterEnum } from 'enums/markets';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivRowCentered } from 'styles/common';

type GlobalFiltersProps = {
    setDateFilter: (value: any) => void;
    setDateParam: (value: any) => void;
    setGlobalFilter: (value: any) => void;
    setGlobalFilterParam: (value: any) => void;
    globalFilter: GlobalFiltersEnum;
    dateFilter: Date | number;
    sportFilter: SportFilterEnum;
    isMobile: boolean;
};

const GlobalFilters: React.FC<GlobalFiltersProps> = ({
    setGlobalFilter,
    setGlobalFilterParam,
    globalFilter,
    isMobile,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const selectedOddsType = useSelector(getOddsType);
    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    return (
        <Container>
            <Filters isMobile={isMobile}>
                <FilterTypeContainer isMobile={isMobile}>
                    {Object.values(GlobalFiltersEnum).map((filterItem) => {
                        return (
                            <GlobalFilter
                                selected={globalFilter === filterItem}
                                isMobile={isMobile}
                                cancelled={filterItem == GlobalFiltersEnum.Canceled}
                                onClick={() => {
                                    setGlobalFilter(filterItem);
                                    setGlobalFilterParam(filterItem);
                                }}
                                key={filterItem}
                            >
                                <FilterIcon
                                    isMobile={isMobile}
                                    className={`icon icon--${
                                        filterItem.toLowerCase() == 'openmarkets' ? 'logo' : filterItem.toLowerCase()
                                    }`}
                                />
                                {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                            </GlobalFilter>
                        );
                    })}
                    {!isMobile && (
                        <DropdownContrainer>
                            <Dropdown<OddsType>
                                list={ODDS_TYPES}
                                selectedItem={t(`common.odds.${selectedOddsType}`)}
                                onSelect={setSelectedOddsType}
                            />
                        </DropdownContrainer>
                    )}
                </FilterTypeContainer>
            </Filters>
        </Container>
    );
};

const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 806px;
`;

const DropdownContrainer = styled.div`
    height: auto;
    width: auto;
`;

const Filters = styled(FlexDiv)<{ isMobile?: boolean }>`
    width: 100%;
    height: ${(props) => (props.isMobile ? '' : '24px')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
    border: ${(props) => (props.isMobile ? '' : '1px solid ' + props.theme.borderColor.primary)};
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 5px;
    font-style: normal;
    font-weight: 600;
    font-size: ${(props) => (props.isMobile ? '17px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '17px' : '14px')};
    align-items: center;
    letter-spacing: 0.01em;
    margin: ${(props) => (props.isMobile ? '0px 30px' : '0px 0px')};
    padding: ${(props) => (props.isMobile ? '0px' : '0px 10px')};
`;

const FilterTypeContainer = styled(FlexDivRowCentered)<{ timeFilters?: boolean; isMobile?: boolean }>`
    justify-content: space-around;
    align-items: ${(props) => (props.isMobile ? 'flex-start' : 'center')};
    flex-direction: ${(props) => (props.isMobile && !props.timeFilters ? 'column' : 'row')};
    height: ${(props) => (props.isMobile && props.timeFilters ? '120px' : '')};
    flex: 1;
`;

const GlobalFilter = styled.span<{ selected?: boolean; isMobile?: boolean; cancelled?: boolean }>`
    margin: ${(props) => (props.isMobile ? '2px 0px' : '0px 2px')};
    text-transform: uppercase;
    white-space: nowrap;
    width: ${(props) => (props.cancelled ? 'max-content' : '')};
    height: ${(props) => (props.isMobile ? '36px' : '')};
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    &:hover {
        cursor: pointer;
        color: ${(props) => (!props.isMobile ? props.theme.textColor.quaternary : '')};
    }
`;

const FilterIcon = styled.i<{ isMobile: boolean }>`
    display: ${(props) => (props.isMobile ? '' : 'none')};
    font-size: 25px;
    margin-right: 15px;
`;

export default GlobalFilters;

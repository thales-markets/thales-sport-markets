import CalendarDatepicker from 'components/CalendarDatepicker';
import Dropdown from 'components/Dropdown';
import { GlobalFiltersEnum, OddsType, ODDS_TYPES, SportFilterEnum } from 'constants/markets';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { addHoursToCurrentDate } from 'utils/formatters/date';
import { getQueryStringVal } from 'utils/useQueryParams';

type GlobalFiltersProps = {
    setDateFilter: (value: any) => void;
    setDateParam: (value: any) => void;
    setGlobalFilter: (value: any) => void;
    setGlobalFilterParam: (value: any) => void;
    setTagFilter: (value: any) => void;
    setTagParam: (value: any) => void;
    setSportFilter: (value: any) => void;
    setSportParam: (value: any) => void;
    globalFilter: GlobalFiltersEnum;
    dateFilter: Date | number;
    sportFilter: SportFilterEnum;
    isMobile: boolean;
};

const GlobalFilters: React.FC<GlobalFiltersProps> = ({
    setDateFilter,
    setDateParam,
    setGlobalFilter,
    setGlobalFilterParam,
    setTagFilter,
    setTagParam,
    setSportFilter,
    setSportParam,
    globalFilter,
    dateFilter,
    sportFilter,
    isMobile,
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
        if (sportFilter == SportFilterEnum.All) {
            setSelectedPeriod(0);
        }
    }, [sportFilter]);

    useEffect(() => {
        if (typeof dateFilter != 'number') {
            setSelectedPeriod(0);
        }
    }, [dateFilter]);

    useEffect(() => {
        setSelectedPeriod(0);
    }, [globalFilter]);

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
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container>
            <Filters isMobile={isMobile}>
                <FilterTypeContainer isMobile={isMobile}>
                    {Object.values(GlobalFiltersEnum)
                        .filter(
                            (filterItem) =>
                                filterItem != GlobalFiltersEnum.All &&
                                filterItem != GlobalFiltersEnum.Claim &&
                                filterItem != GlobalFiltersEnum.History &&
                                filterItem != GlobalFiltersEnum.YourPositions
                        )
                        .map((filterItem) => {
                            return (
                                <GlobalFilter
                                    data-matomo-category="filters"
                                    data-matomo-action={`status-${filterItem.toLowerCase()}`}
                                    selected={globalFilter === filterItem}
                                    isMobile={isMobile}
                                    cancelled={filterItem == GlobalFiltersEnum.Canceled}
                                    onClick={() => {
                                        if (
                                            filterItem === GlobalFiltersEnum.OpenMarkets ||
                                            filterItem === GlobalFiltersEnum.YourPositions
                                        ) {
                                            setDateFilter(0);
                                            setDateParam('');
                                            setTagFilter([]);
                                            setTagParam('');
                                            setSportFilter(SportFilterEnum.All);
                                            setSportParam(SportFilterEnum.All);
                                        }
                                        setGlobalFilter(filterItem);
                                        setGlobalFilterParam(filterItem);
                                    }}
                                    key={filterItem}
                                >
                                    {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                                </GlobalFilter>
                            );
                        })}
                    {!isMobile && (
                        <DropdownContrainer data-matomo-category="filters" data-matomo-action="odds-selector">
                            <Dropdown<OddsType>
                                list={ODDS_TYPES}
                                selectedItem={selectedOddsType}
                                onSelect={setSelectedOddsType}
                            />
                        </DropdownContrainer>
                    )}
                </FilterTypeContainer>
                <FilterTypeContainer isMobile={isMobile}>
                    <TimeFilterContainer
                        selected={selectedPeriod == 3}
                        isMobile={isMobile}
                        onClick={() => {
                            if (selectedPeriod == 3) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(3);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam('3hours');
                                setSelectedPeriod(3);
                            }
                        }}
                        data-matomo-category="filters"
                        data-matomo-action="time-filter-3h"
                    >
                        <Circle />
                        <Label>3h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 12}
                        isMobile={isMobile}
                        onClick={() => {
                            if (selectedPeriod == 12) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(12);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam('12hours');
                                setSelectedPeriod(12);
                            }
                        }}
                        data-matomo-category="filters"
                        data-matomo-action="time-filter-12h"
                    >
                        <Circle />
                        <Label>12h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 72}
                        isMobile={isMobile}
                        onClick={() => {
                            if (selectedPeriod == 72) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(72, true);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam('72hours');
                                setSelectedPeriod(72);
                            }
                        }}
                        data-matomo-category="filters"
                        data-matomo-action="time-filter-3d"
                    >
                        <Circle />
                        <Label>3d</Label>
                    </TimeFilterContainer>
                    {!isMobile && (
                        <CalendarDatepicker date={dateFilter} setDate={setDateFilter} setDateParam={setDateParam} />
                    )}
                </FilterTypeContainer>
            </Filters>
        </Container>
    );
};

const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 800px;
`;

const DropdownContrainer = styled.div`
    height: auto;
    width: auto;
`;

export const Filters = styled(FlexDiv)<{ isMobile?: boolean }>`
    width: 100%;
    height: ${(props) => (props.isMobile ? '' : '24px')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
    border: ${(props) => (props.isMobile ? '' : '1px solid ' + props.theme.borderColor.primary)};
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 5px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    align-items: center;
    letter-spacing: 0.01em;
    margin: 0px 10px;
    padding: 0px 10px;
`;

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ timeFilters?: boolean; isMobile?: boolean }>`
    width: ${(props) => (props.isMobile ? '100%' : props.timeFilters ? '30%' : '70%')};
    justify-content: ${(props) => (props.isMobile ? '' : props.timeFilters ? 'space-evenly' : 'space-around')};
    align-items: ${(props) => (props.isMobile ? 'flex-start' : 'center')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
`;

export const GlobalFilter = styled.span<{ selected?: boolean; isMobile?: boolean; cancelled?: boolean }>`
    margin: 0px 2px;
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

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean; isMobile?: boolean }>`
    margin: 0px 2px;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    height: ${(props) => (props.isMobile ? '36px' : '')};
    & > div {
        background-color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    }
    &:hover {
        cursor: pointer;
        color: ${(props) => (!props.isMobile ? props.theme.textColor.quaternary : '')};
        & > div {
            cursor: pointer;
            color: ${(props) => (!props.isMobile ? props.theme.textColor.quaternary : '')};
        }
        & > label {
            cursor: pointer;
        }
    }
`;

export const Circle = styled.div`
    height: 9px;
    width: 9px;
    border-radius: 50px;
    background-color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    margin-top: 2px;
    margin-right: 3px;
`;

export const Label = styled.label`
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    white-space: nowrap;
`;

export default GlobalFilters;

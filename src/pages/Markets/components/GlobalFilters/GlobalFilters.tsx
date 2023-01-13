import CalendarDatepicker from 'components/CalendarDatepicker';
import Dropdown from 'components/Dropdown';
import { GlobalFiltersEnum, OddsType, ODDS_TYPES, SportFilterEnum } from 'constants/markets';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
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
                case '12':
                    setSelectedPeriod(12);
                    break;
                case '24':
                    setSelectedPeriod(24);
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
                    {Object.values(GlobalFiltersEnum).map((filterItem) => {
                        return (
                            <GlobalFilter
                                data-matomo-category="filters"
                                data-matomo-action={`status-${filterItem.toLowerCase()}`}
                                selected={globalFilter === filterItem}
                                isMobile={isMobile}
                                cancelled={filterItem == GlobalFiltersEnum.Canceled}
                                onClick={() => {
                                    if (filterItem === GlobalFiltersEnum.OpenMarkets) {
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
                        <DropdownContrainer data-matomo-category="filters" data-matomo-action="odds-selector">
                            <Dropdown<OddsType>
                                list={ODDS_TYPES}
                                selectedItem={selectedOddsType}
                                onSelect={setSelectedOddsType}
                            />
                        </DropdownContrainer>
                    )}
                </FilterTypeContainer>
                <Separator isMobile={isMobile} />
                <FilterTypeContainer isMobile={isMobile} timeFilters={true}>
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
                        <Circle isMobile={isMobile} />
                        <Label>12h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 24}
                        isMobile={isMobile}
                        onClick={() => {
                            if (selectedPeriod == 24) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(24);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam('24hours');
                                setSelectedPeriod(24);
                            }
                        }}
                        data-matomo-category="filters"
                        data-matomo-action="time-filter-24h"
                    >
                        <Circle isMobile={isMobile} />
                        <Label>24h</Label>
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
                        <Circle isMobile={isMobile} />
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
    font-size: ${(props) => (props.isMobile ? '17px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '17px' : '14px')};
    align-items: center;
    letter-spacing: 0.01em;
    margin: ${(props) => (props.isMobile ? '0px 50px' : '0px 10px')};
    padding: ${(props) => (props.isMobile ? '0px' : '0px 10px')};
`;

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ timeFilters?: boolean; isMobile?: boolean }>`
    width: ${(props) => (props.isMobile ? '100%' : '70%')};
    justify-content: 'space-around';
    align-items: ${(props) => (props.isMobile ? 'flex-start' : 'center')};
    flex-direction: ${(props) => (props.isMobile && !props.timeFilters ? 'column' : 'row')};
    height: ${(props) => (props.isMobile && props.timeFilters ? '120px' : '')};
`;

export const GlobalFilter = styled.span<{ selected?: boolean; isMobile?: boolean; cancelled?: boolean }>`
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

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean; isMobile?: boolean }>`
    margin: 0px 2px;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
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

export const Circle = styled.div<{ isMobile: boolean }>`
    height: ${(props) => (props.isMobile ? '23px' : '9px')};
    width: ${(props) => (props.isMobile ? '23px' : '9px')};
    border-radius: 50px;
    background-color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    margin-top: ${(props) => (props.isMobile ? '0px' : '2px')};
    margin-right: 3px;
`;

export const Label = styled.label`
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    white-space: nowrap;
    align-self: center;
`;

const FilterIcon = styled.i<{ isMobile: boolean }>`
    display: ${(props) => (props.isMobile ? '' : 'none')};
    font-size: 25px;
    margin-right: 15px;
`;

const Separator = styled(FlexDivColumn)<{ isMobile: boolean }>`
    display: ${(props) => (props.isMobile ? '' : 'none')};
    height: fit-content;
    width: 100%;
    &:before {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 20px;
    }
`;

export default GlobalFilters;

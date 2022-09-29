import Dropdown from 'components/Dropdown';
import { GlobalFiltersEnum, OddsType, ODDS_TYPES, SportFilterEnum } from 'constants/markets';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow, FlexDivRowCentered } from 'styles/common';

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
    return (
        <Container>
            <Filters>
                <FilterTypeContainer>
                    {Object.values(GlobalFiltersEnum)
                        .filter(
                            (filterItem) =>
                                filterItem != GlobalFiltersEnum.Claim &&
                                filterItem != GlobalFiltersEnum.History &&
                                filterItem != GlobalFiltersEnum.YourPositions
                        )
                        .map((filterItem) => {
                            return (
                                <GlobalFilter
                                    selected={globalFilter === filterItem}
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
                    <Dropdown<OddsType>
                        list={ODDS_TYPES}
                        selectedItem={selectedOddsType}
                        onSelect={setSelectedOddsType}
                        style={{ marginRight: '10px' }}
                    />
                </FilterTypeContainer>
                <FilterTypeContainer timeFilters={true}>
                    <TimeFilterContainer
                        selected={selectedPeriod == 1}
                        onClick={() => {
                            if (selectedPeriod == 1) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(1);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam(calculatedDate.toDateString());
                                setSelectedPeriod(1);
                            }
                        }}
                    >
                        <Circle />
                        <Label>1h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 3}
                        onClick={() => {
                            if (selectedPeriod == 3) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(3);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam(calculatedDate.toDateString());
                                setSelectedPeriod(3);
                            }
                        }}
                    >
                        <Circle />
                        <Label>3h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 12}
                        onClick={() => {
                            if (selectedPeriod == 12) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(12);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam(calculatedDate.toDateString());
                                setSelectedPeriod(12);
                            }
                        }}
                    >
                        <Circle />
                        <Label>12h</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 24}
                        onClick={() => {
                            if (selectedPeriod == 24) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(24);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam(calculatedDate.toDateString());
                                setSelectedPeriod(24);
                            }
                        }}
                    >
                        <Circle />
                        <Label>1d</Label>
                    </TimeFilterContainer>
                    <TimeFilterContainer
                        selected={selectedPeriod == 168}
                        onClick={() => {
                            if (selectedPeriod == 168) {
                                setDateFilter(0);
                                setDateParam('');
                                setSelectedPeriod(0);
                            } else {
                                const calculatedDate = addHoursToCurrentDate(168);
                                setDateFilter(calculatedDate.getTime());
                                setDateParam(calculatedDate.toDateString());
                                setSelectedPeriod(168);
                            }
                        }}
                    >
                        <Circle />
                        <Label>7d</Label>
                    </TimeFilterContainer>
                </FilterTypeContainer>
            </Filters>
        </Container>
    );
};

const addHoursToCurrentDate = (numberOfHours: number) => {
    const newDateFilter = new Date();
    newDateFilter.setTime(newDateFilter.getTime() + numberOfHours * 60 * 60 * 1000);
    return newDateFilter;
};

export const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 750px;
`;

export const Filters = styled(FlexDivRow)`
    width: 100%;
    height: 24px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 5px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    align-items: center;
    letter-spacing: 0.01em;
    margin: 0px 20px;
    padding: 0px 10px;
`;

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ timeFilters?: boolean }>`
    width: ${(props) => (props.timeFilters ? '30%' : '70%')};
    justify-content: ${(props) => (props.timeFilters ? 'flex-end' : 'space-around')};
`;

export const GlobalFilter = styled.span<{ selected?: boolean }>`
    margin: 0px 5px;
    text-transform: uppercase;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean }>`
    margin: 0px 5px;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    & > div {
        background-color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    }
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
        & > div {
            cursor: pointer;
            background-color: ${(props) => props.theme.textColor.quaternary};
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

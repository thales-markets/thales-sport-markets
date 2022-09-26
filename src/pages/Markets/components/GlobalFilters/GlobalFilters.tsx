import Dropdown from 'components/Dropdown';
import { OddsType, ODDS_TYPES } from 'constants/markets';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
// import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow, FlexDivRowCentered } from 'styles/common';
// import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

type GlobalFiltersProps = {
    setDateFilter: (value: any) => void;
    setDateParam: (value: any) => void;
};

const GlobalFilters: React.FC<GlobalFiltersProps> = ({ setDateFilter, setDateParam }) => {
    // const { t } = useTranslation();
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
                    <GlobalFilter>ALL</GlobalFilter>
                    <GlobalFilter>LIVE</GlobalFilter>
                    <GlobalFilter>FINISHED</GlobalFilter>
                    <GlobalFilter>SCHEDULED</GlobalFilter>
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
                            console.log(selectedPeriod);
                            if (selectedPeriod == 1) {
                                console.log('prolaz');
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
                                console.log('prolaz');
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
                                console.log('prolaz');
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
                                console.log('prolaz');
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
                                console.log('prolaz');
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
    width: 50%;
    justify-content: ${(props) => (props.timeFilters ? 'flex-end' : 'space-around')};
`;

export const GlobalFilter = styled.span`
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const TimeFilterContainer = styled(FlexDivRow)<{ selected: boolean }>`
    margin: 0px 10px;
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

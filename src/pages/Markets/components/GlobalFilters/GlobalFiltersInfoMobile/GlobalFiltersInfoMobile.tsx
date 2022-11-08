import Dropdown from 'components/Dropdown';
import { GlobalFiltersEnum, OddsType, ODDS_TYPES, SportFilterEnum } from 'constants/markets';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { getQueryStringVal } from 'utils/useQueryParams';

type GlobalFiltersInfoMobileProps = {
    globalFilter: GlobalFiltersEnum;
    dateFilter: Date | number;
    sportFilter: SportFilterEnum;
};

const GlobalFiltersInfoMobile: React.FC<GlobalFiltersInfoMobileProps> = ({ globalFilter, dateFilter, sportFilter }) => {
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
            <Filters>
                <FilterTypeContainer>
                    <GlobalFilter selected={true}>
                        {t(`market.filter-label.global.${globalFilter.toLowerCase()}`)}
                    </GlobalFilter>
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
            </Filters>
        </Container>
    );
};

export const Container = styled(FlexDiv)`
    width: 100%;
    max-width: 750px;
    margin: 10px 0px;
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
    margin: 0px 5px;
    padding: 0px 10px;
    justify-content: space-between;
`;

export const FiltersMobile = styled(FlexDivColumn)`
    width: 100%;
    color: ${(props) => props.theme.textColor.secondary};
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    align-items: center;
    letter-spacing: 0.01em;
    margin: 0px 20px;
    padding: 0px 10px;
`;

export const FilterTypeContainer = styled(FlexDivRowCentered)<{ timeFilters?: boolean; isMobile?: boolean }>`
    width: max-content;
    justify-content: ${(props) => (props.isMobile ? '' : props.timeFilters ? 'space-evenly' : 'space-around')};
    align-items: ${(props) => (props.isMobile ? 'flex-start' : 'center')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
`;

export const GlobalFilter = styled.span<{ selected?: boolean; isMobile?: boolean; cancelled?: boolean }>`
    margin: 0px 2px;
    text-transform: uppercase;
    width: ${(props) => (props.cancelled ? 'max-content' : '')};
    height: ${(props) => (props.isMobile ? '36px' : '')};
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : '')};
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
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

export default GlobalFiltersInfoMobile;

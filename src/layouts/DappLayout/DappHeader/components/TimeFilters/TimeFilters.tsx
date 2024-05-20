import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDateFilter, getDatePeriodFilter, setDateFilter, setDatePeriodFilter } from 'redux/modules/market';
import { addHoursToCurrentDate } from 'thales-utils';
import useQueryParam from 'utils/useQueryParams';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC = () => {
    const dispatch = useDispatch();

    const isMobile = useSelector(getIsMobile);
    const dateFilter = useSelector(getDateFilter);
    const datePeriodFilter = useSelector(getDatePeriodFilter);

    const [dateParam, setDateParam] = useQueryParam('date', '');

    useEffect(() => {
        if (typeof dateFilter != 'number') {
            dispatch(setDatePeriodFilter(0));
        }
    }, [dateFilter, dispatch]);

    useEffect(() => {
        if (typeof dateFilter == 'number') {
            const timeFilter = dateParam?.split('h')[0];
            switch (timeFilter) {
                case '12':
                    dispatch(setDatePeriodFilter(12));
                    break;
                case '24':
                    dispatch(setDatePeriodFilter(24));
                    break;
                case '72':
                    dispatch(setDatePeriodFilter(72));
                    break;
            }
        }
    }, [dateParam, dateFilter, dispatch]);

    return (
        <FilterTypeContainer isMobile={isMobile}>
            <TimeFilterContainer
                selected={datePeriodFilter == 12}
                onClick={() => {
                    if (datePeriodFilter == 12) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
                        const calculatedDate = addHoursToCurrentDate(12);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('12hours');
                        dispatch(setDatePeriodFilter(12));
                    }
                }}
            >
                <Circle isMobile={isMobile} />
                <Label>12h</Label>
            </TimeFilterContainer>
            <TimeFilterContainer
                selected={datePeriodFilter == 24}
                onClick={() => {
                    if (datePeriodFilter == 24) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
                        const calculatedDate = addHoursToCurrentDate(24);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('24hours');
                        dispatch(setDatePeriodFilter(24));
                    }
                }}
            >
                <Circle isMobile={isMobile} />
                <Label>24h</Label>
            </TimeFilterContainer>
            <TimeFilterContainer
                selected={datePeriodFilter == 72}
                onClick={() => {
                    if (datePeriodFilter == 72) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
                        const calculatedDate = addHoursToCurrentDate(72, true);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('72hours');
                        dispatch(setDatePeriodFilter(72));
                    }
                }}
            >
                <Circle isMobile={isMobile} />
                <Label>3d</Label>
            </TimeFilterContainer>
        </FilterTypeContainer>
    );
};

export default TimeFilters;

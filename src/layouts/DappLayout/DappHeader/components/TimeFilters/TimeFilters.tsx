import { TimeFilter } from 'enums/filters';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDatePeriodFilter, setDatePeriodFilter } from 'redux/modules/market';
import useQueryParam from 'utils/useQueryParams';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC<{ isTimeLimited?: boolean }> = ({ isTimeLimited }) => {
    const dispatch = useDispatch();

    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const isMobile = useSelector(getIsMobile);

    const [, setDateParam] = useQueryParam('date', '');

    return (
        <FilterTypeContainer isMobile={isMobile}>
            {(!isTimeLimited || datePeriodFilter === TimeFilter.ALL) && (
                <TimeFilterContainer
                    selected={datePeriodFilter === TimeFilter.ALL}
                    onClick={() => {
                        setDateParam('');
                        dispatch(setDatePeriodFilter(TimeFilter.ALL));
                    }}
                >
                    <Circle isMobile={isMobile} />
                    <Label>ALL</Label>
                </TimeFilterContainer>
            )}
            {(!isTimeLimited || datePeriodFilter === TimeFilter.TWELVE_HOURS) && (
                <TimeFilterContainer
                    selected={datePeriodFilter === TimeFilter.TWELVE_HOURS}
                    onClick={() => {
                        if (datePeriodFilter === TimeFilter.TWELVE_HOURS) {
                            setDateParam('');
                            dispatch(setDatePeriodFilter(TimeFilter.ALL));
                        } else {
                            setDateParam('12hours');
                            dispatch(setDatePeriodFilter(TimeFilter.TWELVE_HOURS));
                        }
                    }}
                >
                    <Circle isMobile={isMobile} />
                    <Label>12H</Label>
                </TimeFilterContainer>
            )}
            {(!isTimeLimited || datePeriodFilter === TimeFilter.DAY) && (
                <TimeFilterContainer
                    selected={datePeriodFilter === TimeFilter.DAY}
                    onClick={() => {
                        if (datePeriodFilter === TimeFilter.DAY) {
                            setDateParam('');
                            dispatch(setDatePeriodFilter(TimeFilter.ALL));
                        } else {
                            setDateParam('24hours');
                            dispatch(setDatePeriodFilter(TimeFilter.DAY));
                        }
                    }}
                >
                    <Circle isMobile={isMobile} />
                    <Label>24H</Label>
                </TimeFilterContainer>
            )}
            {(!isTimeLimited || datePeriodFilter === TimeFilter.THREE_DAYS) && (
                <TimeFilterContainer
                    selected={datePeriodFilter === TimeFilter.THREE_DAYS}
                    onClick={() => {
                        if (datePeriodFilter === TimeFilter.THREE_DAYS) {
                            setDateParam('');
                            dispatch(setDatePeriodFilter(TimeFilter.ALL));
                        } else {
                            setDateParam('72hours');
                            dispatch(setDatePeriodFilter(TimeFilter.THREE_DAYS));
                        }
                    }}
                >
                    <Circle isMobile={isMobile} />
                    <Label>3D</Label>
                </TimeFilterContainer>
            )}
        </FilterTypeContainer>
    );
};

export default TimeFilters;

import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDatePeriodFilter, setDatePeriodFilter } from 'redux/modules/market';
import useQueryParam from 'utils/useQueryParams';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC = () => {
    const dispatch = useDispatch();

    const isMobile = useSelector(getIsMobile);
    const datePeriodFilter = useSelector(getDatePeriodFilter);

    const [, setDateParam] = useQueryParam('date', '');

    return (
        <FilterTypeContainer isMobile={isMobile}>
            <TimeFilterContainer
                selected={datePeriodFilter == 12}
                onClick={() => {
                    if (datePeriodFilter == 12) {
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
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
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
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
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    } else {
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

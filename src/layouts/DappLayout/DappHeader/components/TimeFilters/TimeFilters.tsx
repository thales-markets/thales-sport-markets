import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDatePeriodFilter, getSportFilter, setDatePeriodFilter } from 'redux/modules/market';
import { isSportTimeLimited } from 'utils/marketsV2';
import useQueryParam from 'utils/useQueryParams';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC = () => {
    const dispatch = useDispatch();

    const isMobile = useSelector(getIsMobile);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const sportFilter = useSelector(getSportFilter);

    const [, setDateParam] = useQueryParam('date', '');

    return (
        <FilterTypeContainer isMobile={isMobile}>
            {(!isSportTimeLimited(sportFilter) || datePeriodFilter == 0) && (
                <TimeFilterContainer
                    selected={datePeriodFilter == 0}
                    onClick={() => {
                        setDateParam('');
                        dispatch(setDatePeriodFilter(0));
                    }}
                >
                    <Circle isMobile={isMobile} />
                    <Label>ALL</Label>
                </TimeFilterContainer>
            )}
            {(!isSportTimeLimited(sportFilter) || datePeriodFilter == 12) && (
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
                    <Label>12H</Label>
                </TimeFilterContainer>
            )}
            {(!isSportTimeLimited(sportFilter) || datePeriodFilter == 0) && (
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
                    <Label>24H</Label>
                </TimeFilterContainer>
            )}
            {(!isSportTimeLimited(sportFilter) || datePeriodFilter == 0) && (
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
                    <Label>3D</Label>
                </TimeFilterContainer>
            )}
        </FilterTypeContainer>
    );
};

export default TimeFilters;

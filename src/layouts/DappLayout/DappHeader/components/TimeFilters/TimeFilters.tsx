import { SportFilterEnum } from 'enums/markets';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDateFilter, getGlobalFilter, getSportFilter, setDateFilter } from 'redux/modules/market';
import { RootState } from 'redux/rootReducer';
import { addHoursToCurrentDate } from 'thales-utils';
import useQueryParam from 'utils/useQueryParams';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC = () => {
    const dispatch = useDispatch();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const dateFilter = useSelector((state: RootState) => getDateFilter(state));
    const globalFilter = useSelector((state: RootState) => getGlobalFilter(state));
    const sportFilter = useSelector((state: RootState) => getSportFilter(state));

    const [dateParam, setDateParam] = useQueryParam('date', '');

    const [selectedPeriod, setSelectedPeriod] = useState<number>(0);

    useEffect(() => {
        if (typeof dateFilter != 'number') {
            setSelectedPeriod(0);
        }
    }, [dateFilter]);

    useEffect(() => {
        if (typeof dateFilter == 'number') {
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

    useEffect(() => {
        setSelectedPeriod(0);
    }, [globalFilter]);

    useEffect(() => {
        if (sportFilter == SportFilterEnum.All) {
            setSelectedPeriod(0);
        }
    }, [sportFilter]);

    return (
        <FilterTypeContainer isMobile={isMobile}>
            <TimeFilterContainer
                selected={selectedPeriod == 12}
                isMobile={isMobile}
                onClick={() => {
                    if (selectedPeriod == 12) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        setSelectedPeriod(0);
                    } else {
                        const calculatedDate = addHoursToCurrentDate(12);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('12hours');
                        setSelectedPeriod(12);
                    }
                }}
            >
                <Circle isMobile={isMobile} />
                <Label>12h</Label>
            </TimeFilterContainer>
            <TimeFilterContainer
                selected={selectedPeriod == 24}
                isMobile={isMobile}
                onClick={() => {
                    if (selectedPeriod == 24) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        setSelectedPeriod(0);
                    } else {
                        const calculatedDate = addHoursToCurrentDate(24);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('24hours');
                        setSelectedPeriod(24);
                    }
                }}
            >
                <Circle isMobile={isMobile} />
                <Label>24h</Label>
            </TimeFilterContainer>
            <TimeFilterContainer
                selected={selectedPeriod == 72}
                isMobile={isMobile}
                onClick={() => {
                    if (selectedPeriod == 72) {
                        dispatch(setDateFilter(0));
                        setDateParam('');
                        setSelectedPeriod(0);
                    } else {
                        const calculatedDate = addHoursToCurrentDate(72, true);
                        dispatch(setDateFilter(calculatedDate.getTime()));
                        setDateParam('72hours');
                        setSelectedPeriod(72);
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

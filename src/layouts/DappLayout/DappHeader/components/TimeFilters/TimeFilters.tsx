import { TimeFilter } from 'enums/filters';
import useGamesCountQuery from 'queries/markets/useGamesCountQuery';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getDatePeriodFilter, getSportFilter, getTagFilter, setDatePeriodFilter } from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import { SupportedNetwork } from 'types/network';
import { getFiltersInfo } from 'utils/marketsV2';
import useQueryParam from 'utils/useQueryParams';
import { useChainId } from 'wagmi';
import { Circle, FilterTypeContainer, Label, TimeFilterContainer } from './styled-components';

const TimeFilters: React.FC = () => {
    const dispatch = useDispatch();

    const networkId = useChainId() as SupportedNetwork;

    const tagFilter = useSelector(getTagFilter);
    const sportFilter = useSelector(getSportFilter);
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const isMobile = useSelector(getIsMobile);

    const [, setDateParam] = useQueryParam('date', '');

    const gamesCountQuery = useGamesCountQuery(networkId);

    const gamesCount = useMemo(() => {
        if (gamesCountQuery.isSuccess && gamesCountQuery.data) {
            return gamesCountQuery.data;
        }
        return undefined;
    }, [gamesCountQuery.data, gamesCountQuery.isSuccess]);

    const gameMultipliersQuery = useGameMultipliersQuery();

    const gameMultipliers = useMemo(
        () => (gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : []),
        [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess]
    );

    const { timeLimitFilter } = getFiltersInfo(sportFilter, tagFilter, gamesCount, gameMultipliers, favouriteLeagues);
    const isSportTimeLimited = timeLimitFilter !== TimeFilter.ALL;

    return (
        <FilterTypeContainer isMobile={isMobile}>
            {(!isSportTimeLimited || datePeriodFilter === TimeFilter.ALL) && (
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
            {(!isSportTimeLimited || datePeriodFilter === TimeFilter.TWELVE_HOURS) && (
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
            {(!isSportTimeLimited || datePeriodFilter === TimeFilter.DAY) && (
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
            {(!isSportTimeLimited || datePeriodFilter === TimeFilter.THREE_DAYS) && (
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

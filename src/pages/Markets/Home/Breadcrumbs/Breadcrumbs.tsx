import { SportFilter } from 'enums/markets';
import { uniq, uniqBy } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    getSportFilter,
    getTagFilter,
    getTournamentFilter,
    setTagFilter,
    setTournamentFilter,
} from 'redux/modules/market';
import useQueryParam from 'utils/useQueryParams';
import { Breadcrumb, BreadcrumbsContainer } from './styled-components';

const Breadcrumbs: React.FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const tournamentFilter = useSelector(getTournamentFilter);
    const [, setTagParam] = useQueryParam('tag', '');
    const [, setTournamentParam] = useQueryParam('tournament', '');

    const uniqueTagFilter = uniqBy(tagFilter, 'label');
    const uniqueTournamentFilter = uniq(tournamentFilter);

    return (
        <BreadcrumbsContainer>
            <Breadcrumb
                onClick={() => {
                    if (sportFilter !== SportFilter.PlayerProps) {
                        dispatch(setTagFilter([]));
                        setTagParam('');
                        dispatch(setTournamentFilter([]));
                        setTournamentParam('');
                    }
                }}
            >
                {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
            </Breadcrumb>

            {!!tagFilter.length &&
                uniqueTagFilter.map((tag, index) => {
                    return (
                        <React.Fragment key={tag.label}>
                            {index === 0 ? ' / ' : ''}
                            <Breadcrumb
                                onClick={() => {
                                    dispatch(setTagFilter([tag]));
                                    dispatch(setTournamentFilter([]));
                                    setTournamentParam('');
                                }}
                            >
                                {tag.label}
                            </Breadcrumb>
                            {index === uniqueTagFilter.length - 1 ? '' : ', '}
                        </React.Fragment>
                    );
                })}
            {!!tournamentFilter.length &&
                uniqueTournamentFilter.map((tournament, index) => {
                    return (
                        <React.Fragment key={tournament}>
                            {index === 0 ? ' / ' : ''}
                            <Breadcrumb onClick={() => dispatch(setTournamentFilter([tournament]))}>
                                {tournament}
                            </Breadcrumb>
                            {index === uniqueTournamentFilter.length - 1 ? '' : ', '}
                        </React.Fragment>
                    );
                })}
        </BreadcrumbsContainer>
    );
};

export default Breadcrumbs;

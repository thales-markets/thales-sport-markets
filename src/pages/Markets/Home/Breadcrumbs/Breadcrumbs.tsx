import { uniqBy } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { RootState } from 'redux/rootReducer';
import { Breadcrumb, BreadcrumbsContainer } from './styled-components';

const Breadcrumbs: React.FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const sportFilter = useSelector((state: RootState) => getSportFilter(state));
    const tagFilter = useSelector((state: RootState) => getTagFilter(state));
    const uniqueTagFilter = uniqBy(tagFilter, 'label');

    return (
        <BreadcrumbsContainer>
            <Breadcrumb onClick={() => dispatch(setTagFilter([]))}>
                {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
            </Breadcrumb>

            {!!tagFilter.length &&
                uniqueTagFilter.map((tag, index) => {
                    return (
                        <React.Fragment key={tag.label}>
                            {index === 0 ? ' / ' : ''}
                            <Breadcrumb onClick={() => dispatch(setTagFilter([tag]))}>{tag.label}</Breadcrumb>
                            {index === uniqueTagFilter.length - 1 ? '' : ', '}
                        </React.Fragment>
                    );
                })}
        </BreadcrumbsContainer>
    );
};

export default Breadcrumbs;

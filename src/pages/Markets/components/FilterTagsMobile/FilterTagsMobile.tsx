import { SportFilter, StatusFilter } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    getDatePeriodFilter,
    getMarketSearch,
    getMarketTypeFilter,
    getSportFilter,
    getStatusFilter,
    getTagFilter,
    setDatePeriodFilter,
    setMarketSearch,
    setMarketTypeFilter,
    setSportFilter,
    setStatusFilter,
    setTagFilter,
} from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDiv, FlexDivRowCentered } from 'styles/common';
import { getMarketTypeName } from 'utils/markets';
import useQueryParam from 'utils/useQueryParams';

const FilterTagsMobile: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const marketSearch = useSelector(getMarketSearch);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const statusFilter = useSelector(getStatusFilter);
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const [, setSportParam] = useQueryParam('sport', '');
    const [, setStatusParam] = useQueryParam('status', '');
    const [, setSearchParam] = useQueryParam('search', '');
    const [dateParam, setDateParam] = useQueryParam('date', '');
    const [, setTagParam] = useQueryParam('tag', '');

    const dateTagLabel = dateParam?.split('h')[0] + ' ' + t('common.time-remaining.hours');
    const hideContainer =
        marketSearch == '' &&
        statusFilter == StatusFilter.OPEN_MARKETS &&
        datePeriodFilter == 0 &&
        sportFilter == SportFilter.All &&
        marketTypeFilter == undefined;

    return (
        <Container hideContainer={hideContainer}>
            {marketSearch != '' && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.mobile-tags.search`)}: {marketSearch}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(setMarketSearch(''));
                                setSearchParam('');
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {statusFilter != StatusFilter.OPEN_MARKETS && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.global.${statusFilter.toLowerCase()}`)}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(setStatusFilter(StatusFilter.OPEN_MARKETS));
                                setStatusParam(StatusFilter.OPEN_MARKETS);
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {datePeriodFilter != 0 && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {dateTagLabel}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(setDatePeriodFilter(0));
                                setDateParam('');
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {sportFilter != SportFilter.All && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(setSportFilter(SportFilter.All));
                                setSportParam(SportFilter.All);
                                dispatch(setTagFilter([]));
                                setTagParam('');
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {tagFilter.length != 0 &&
                tagFilter.map((tag, index) => {
                    return (
                        <FilterTagContainer key={index}>
                            <FilterTagLabel>
                                {tag.label}
                                <ClearIcon
                                    className="icon icon--close"
                                    onClick={() => {
                                        if (tagFilter.length == 1) {
                                            dispatch(setTagFilter([]));
                                            setTagParam('');
                                        } else {
                                            const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                            dispatch(setTagFilter(newTagFilters));
                                            const newTagParam = newTagFilters
                                                .map((tagInfo) => tagInfo.label)
                                                .toString();
                                            setTagParam(newTagParam);
                                        }
                                    }}
                                />
                            </FilterTagLabel>
                        </FilterTagContainer>
                    );
                })}
            {marketTypeFilter !== undefined && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {`type: ${getMarketTypeName(marketTypeFilter, true)}`}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(setMarketTypeFilter(undefined));
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)<{ hideContainer: boolean }>`
    height: 36px;
    position: relative;
    justify-content: flex-start;
    width: 100%;
    display: ${(props) => (props.hideContainer ? 'none' : '')};
    overflow-x: auto;
`;

const FilterTagContainer = styled(FlexDiv)`
    width: max-content;
    max-width: 180px;
    background: ${(props) => props.theme.background.tertiary};
    height: 24px;
    border-radius: 15px;
    align-items: center;
    padding: 0px 10px;
    margin: 0px 5px;
`;

const FilterTagLabel = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 11px;
    color: ${(props) => props.theme.background.primary};
    text-transform: lowercase;
    display: flex;
    width: max-content;
`;

const ClearIcon = styled.i`
    font-size: 10px;
    padding-left: 10px;
    align-self: center;
`;

export default FilterTagsMobile;

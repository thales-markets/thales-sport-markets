import { GlobalFiltersEnum, SportFilterEnum } from 'constants/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setMarketSearch } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDiv, FlexDivRowCentered } from 'styles/common';
import { Tags } from 'types/markets';
import { getQueryStringVal } from 'utils/useQueryParams';

type FilterTagsMobileProps = {
    sportFilter: string;
    tagFilter: Tags;
    globalFilter: string;
    marketSearch: string;
    setSportFilter: (value: SportFilterEnum) => void;
    setSportParam: (val: string) => void;
    setTagFilter: (value: Tags) => void;
    setTagParam: (val: string) => void;
    setGlobalFilter: (value: GlobalFiltersEnum) => void;
    setGlobalFilterParam: (val: string) => void;
    setDateFilter: (value: number | Date) => void;
    setDateParam: (val: string) => void;
    setSearchParam: (val: string) => void;
};

const FilterTagsMobile: React.FC<FilterTagsMobileProps> = ({
    sportFilter,
    tagFilter,
    globalFilter,
    marketSearch,
    setSportFilter,
    setSportParam,
    setTagFilter,
    setTagParam,
    setGlobalFilter,
    setGlobalFilterParam,
    setDateFilter,
    setDateParam,
    setSearchParam,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const dateParam = getQueryStringVal('date');

    const dateTagLabel = dateParam?.split('h')[0] + ' ' + t('common.time-remaining.hours');
    const hideContainer =
        marketSearch == '' &&
        globalFilter == GlobalFiltersEnum.OpenMarkets &&
        dateParam == null &&
        sportFilter == SportFilterEnum.All;

    return (
        <Container hideContainer={hideContainer}>
            {marketSearch != '' && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.mobile-tags.search`)}: {marketSearch}
                        <ClearButton
                            onClick={() => {
                                dispatch(setMarketSearch(''));
                                setSearchParam('');
                            }}
                        >
                            X
                        </ClearButton>
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {globalFilter != GlobalFiltersEnum.OpenMarkets && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.global.${globalFilter.toLowerCase()}`)}
                        <ClearButton
                            onClick={() => {
                                setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
                                setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
                            }}
                        >
                            X
                        </ClearButton>
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {dateParam != null && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {dateTagLabel}
                        <ClearButton
                            onClick={() => {
                                setDateFilter(0);
                                setDateParam('');
                            }}
                        >
                            X
                        </ClearButton>
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {sportFilter != SportFilterEnum.All && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {sportFilter}
                        <ClearButton
                            onClick={() => {
                                setSportFilter(SportFilterEnum.All);
                                setSportParam(SportFilterEnum.All);
                                setTagFilter([]);
                                setTagParam('');
                            }}
                        >
                            X
                        </ClearButton>
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {tagFilter.length != 0 &&
                tagFilter.map((tag, index) => {
                    return (
                        <FilterTagContainer key={index}>
                            <FilterTagLabel>
                                {tag.label}
                                <ClearButton
                                    onClick={() => {
                                        if (tagFilter.length == 1) {
                                            setTagFilter([]);
                                            setTagParam('');
                                        } else {
                                            const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                            setTagFilter(newTagFilters);
                                            const newTagParam = newTagFilters
                                                .map((tagInfo) => tagInfo.label)
                                                .toString();
                                            setTagParam(newTagParam);
                                        }
                                    }}
                                >
                                    X
                                </ClearButton>
                            </FilterTagLabel>
                        </FilterTagContainer>
                    );
                })}
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)<{ hideContainer: boolean }>`
    height: 36px;
    position: relative;
    margin-bottom: 5px;
    justify-content: flex-start;
    width: 100%;
    display: ${(props) => (props.hideContainer ? 'none' : '')};
    overflow-x: auto;
    scrollbar-width: 5px; /* Firefox */
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
        /* WebKit */
        width: 5px;
        height: 5px;
    }
    @media (max-width: 950px) {
        margin: 0;
        scrollbar-width: 0px; /* Firefox */
        ::-webkit-scrollbar {
            /* WebKit */
            width: 0px;
            height: 0px;
        }
    }
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
    font-weight: 800;
    font-size: 13px;
    line-height: 15px;
    color: ${(props) => props.theme.background.primary};
    text-transform: lowercase;
    display: flex;
    width: max-content;
`;

const ClearButton = styled.button`
    display: flex;
    font-size: 13px;
    font-weight: 800;
    background: ${(props) => props.theme.background.tertiary};
    color: ${(props) => props.theme.background.primary};
    cursor: pointer;
    border: none;
    width: fit-content;
    margin-left: 10px;
    padding: 0px;
`;

export default FilterTagsMobile;

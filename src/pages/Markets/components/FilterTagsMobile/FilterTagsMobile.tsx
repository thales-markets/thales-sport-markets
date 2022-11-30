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
    tagsList: Tags;
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
    tagsList,
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
    const hideContainer =
        marketSearch != '' &&
        globalFilter != GlobalFiltersEnum.OpenMarkets &&
        dateParam != null &&
        sportFilter != SportFilterEnum.All;
    console.log(hideContainer);
    console.log(marketSearch != '');
    console.log(globalFilter != GlobalFiltersEnum.OpenMarkets);
    console.log(dateParam != null);
    console.log(dateParam);
    console.log(sportFilter != SportFilterEnum.All);
    return (
        <Container>
            {marketSearch != '' && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        Search: {marketSearch}
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
                        {dateParam}
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
                            }}
                        >
                            X
                        </ClearButton>
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {tagsList.length == 0 &&
                tagsList.map((tag) => {
                    <FilterTagContainer>
                        <FilterTagLabel>
                            {tag.label}
                            <ClearButton
                                onClick={() => {
                                    if (tagsList.length == 1) {
                                        setTagFilter([]);
                                        setTagParam('');
                                    } else {
                                        const newTagFilters = tagFilter.filter((tagInfo) => tagInfo.id != tag.id);
                                        setTagFilter(newTagFilters);
                                        const newTagParam = newTagFilters.map((tagInfo) => tagInfo.label).toString();
                                        setTagParam(newTagParam);
                                    }
                                }}
                            >
                                X
                            </ClearButton>
                        </FilterTagLabel>
                    </FilterTagContainer>;
                })}
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    height: 36px;
    position: relative;
    margin-bottom: 5px;
    justify-content: flex-start;
    width: 100%;
`;

const FilterTagContainer = styled(FlexDiv)`
    width: fit-content;
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
`;

const ClearButton = styled.button`
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

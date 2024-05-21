import { MarketType } from 'enums/marketTypes';
import { GlobalFiltersEnum, SportFilterEnum } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setMarketSearch } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDiv, FlexDivRowCentered } from 'styles/common';
import { Tags } from 'types/markets';
import { getMarketTypeName } from 'utils/markets';
import { getQueryStringVal } from 'utils/useQueryParams';

type FilterTagsMobileProps = {
    sportFilter: string;
    tagFilter: Tags;
    globalFilter: string;
    marketSearch: string;
    marketTypeFilter: MarketType | undefined;
    setSportFilter: (value: SportFilterEnum) => void;
    setSportParam: (val: string) => void;
    setTagFilter: (value: Tags) => void;
    setTagParam: (val: string) => void;
    setGlobalFilter: (value: GlobalFiltersEnum) => void;
    setGlobalFilterParam: (val: string) => void;
    setDateFilter: (value: number | Date) => void;
    setDateParam: (val: string) => void;
    setSearchParam: (val: string) => void;
    setMarketTypeFilter: (val: MarketType | undefined) => void;
};

const FilterTagsMobile: React.FC<FilterTagsMobileProps> = ({
    sportFilter,
    tagFilter,
    globalFilter,
    marketSearch,
    marketTypeFilter,
    setSportFilter,
    setSportParam,
    setTagFilter,
    setTagParam,
    setGlobalFilter,
    setGlobalFilterParam,
    setDateFilter,
    setDateParam,
    setSearchParam,
    setMarketTypeFilter,
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
            {globalFilter != GlobalFiltersEnum.OpenMarkets && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.global.${globalFilter.toLowerCase()}`)}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
                                setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {dateParam != null && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {dateTagLabel}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                setDateFilter(0);
                                setDateParam('');
                            }}
                        />
                    </FilterTagLabel>
                </FilterTagContainer>
            )}
            {sportFilter != SportFilterEnum.All && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                setSportFilter(SportFilterEnum.All);
                                setSportParam(SportFilterEnum.All);
                                setTagFilter([]);
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
                                />
                            </FilterTagLabel>
                        </FilterTagContainer>
                    );
                })}
            {marketTypeFilter !== undefined && (
                <FilterTagContainer>
                    <FilterTagLabel>
                        {`type: ${getMarketTypeName(marketTypeFilter)}`}
                        <ClearIcon
                            className="icon icon--close"
                            onClick={() => {
                                setMarketTypeFilter(undefined);
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
    font-weight: 800;
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

import { GlobalFiltersEnum, SportFilterEnum } from 'enums/markets';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow, FlexDivRowCentered } from 'styles/common';

type GlobalFiltersProps = {
    setDateFilter: (value: any) => void;
    setDateParam: (value: any) => void;
    setGlobalFilter: (value: any) => void;
    setGlobalFilterParam: (value: any) => void;
    globalFilter: GlobalFiltersEnum;
    dateFilter: Date | number;
    sportFilter: SportFilterEnum;
    isMobile: boolean;
};

const GlobalFilters: React.FC<GlobalFiltersProps> = ({
    setGlobalFilter,
    setGlobalFilterParam,
    globalFilter,
    isMobile,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(globalFilter !== GlobalFiltersEnum.OpenMarkets);

    return (
        <Wrapper>
            <Container isMobile={isMobile}>
                <LeftContainer>
                    <LabelContainer className={`${open ? 'selected' : ''}`} onClick={() => setOpen(!open)}>
                        <FlexDiv>
                            <SportIcon className={`icon icon--filters`} />
                            <Label>{t('common.filters')}</Label>
                        </FlexDiv>
                        <FlexDiv gap={15}>
                            {!open ? (
                                <ArrowIcon className={`icon icon--arrow ${open ? 'selected' : ''}`} />
                            ) : (
                                <ArrowIcon down={true} className={`icon icon--arrow-down ${open ? 'selected' : ''}`} />
                            )}
                        </FlexDiv>
                    </LabelContainer>
                </LeftContainer>
            </Container>
            <FiltersContainer open={open}>
                {Object.values(GlobalFiltersEnum).map((filterItem, index) => {
                    return (
                        <FilterContainer
                            isLast={Object.values(GlobalFiltersEnum).length === index - 1}
                            isMobile={isMobile}
                            key={filterItem}
                        >
                            <GlobalFilter
                                className={`${globalFilter === filterItem ? 'selected' : ''}`}
                                onClick={() => {
                                    setGlobalFilter(filterItem);
                                    setGlobalFilterParam(filterItem);
                                }}
                            >
                                <FilterIcon isMobile={isMobile} className={`icon ${getIcon(filterItem)}`} />
                                {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                            </GlobalFilter>
                        </FilterContainer>
                    );
                })}
            </FiltersContainer>
        </Wrapper>
    );
};

const getIcon = (filter: GlobalFiltersEnum) => {
    return filter === GlobalFiltersEnum.OpenMarkets
        ? `icon--play`
        : filter === GlobalFiltersEnum.PendingMarkets
        ? `icon--ongoing`
        : filter === GlobalFiltersEnum.Canceled
        ? `icon--pause`
        : 'icon--double-check';
};

const Wrapper = styled.div<{ isMobile?: boolean }>`
    border-bottom: 1px solid ${(props) => props.theme.textColor.secondary};
    padding-bottom: 10px;
    margin-bottom: 10px;
`;

const Container = styled(FlexDivRowCentered)<{ isMobile?: boolean }>`
    font-style: normal;
    font-weight: 600;
    font-size: ${(props) => (props.isMobile ? '17px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '17px' : '13px')};
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    margin-left: ${(props) => (props.isMobile ? '30px' : '0px')};
    margin-right: ${(props) => (props.isMobile ? '30px' : '0px')};
    position: relative;
    color: ${(props) => props.theme.textColor.quinary};
    justify-content: flex-start;
    margin-bottom: 5px;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    flex: 1;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    flex: 1;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }

    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const Label = styled.div`
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SportIcon = styled.i`
    font-size: 25px;
    margin-right: 15px;
`;

const ArrowIcon = styled.i<{ down?: boolean }>`
    font-size: 12px;
    margin-left: 5px;
    text-transform: none;
    &.selected,
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const FiltersContainer = styled.div<{ open: boolean }>`
    display: ${(props) => (!props.open ? 'none' : '')};
`;

const FilterContainer = styled(FlexDivRow)<{ isMobile: boolean; isLast?: boolean }>`
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: ${(props) => (props.isLast ? '0px' : '5px')};
    margin-right: ${(props) => (props.isMobile ? '30px' : '0px')};
    justify-content: flex-start;
    position: relative;
    align-items: center;
`;

const GlobalFilter = styled.div`
    width: 100%;
    padding-left: 10px;
    justify-content: flex-start;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }

    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const FilterIcon = styled.i<{ isMobile: boolean }>`
    font-weight: 400;
    font-size: 22px;
    margin-right: 15px;
    text-transform: none;
`;

export default GlobalFilters;

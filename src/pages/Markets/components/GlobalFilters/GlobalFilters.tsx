import { GlobalFiltersEnum } from 'enums/markets';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivSpaceBetween } from 'styles/common';

type GlobalFiltersProps = {
    setGlobalFilter: (value: any) => void;
    setGlobalFilterParam: (value: any) => void;
    globalFilter: GlobalFiltersEnum;
};

const GlobalFilters: React.FC<GlobalFiltersProps> = ({ setGlobalFilter, setGlobalFilterParam, globalFilter }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);
    const [open, setOpen] = useState(globalFilter !== GlobalFiltersEnum.OpenMarkets);

    return (
        <Wrapper>
            {!isMobile && (
                <Container className={open ? 'selected' : ''} onClick={() => setOpen(!open)}>
                    <FlexDiv>
                        <Icon className={`icon icon--filters2`} />
                        <Label>{t('common.status')}</Label>
                    </FlexDiv>
                    <FlexDiv>
                        {open ? (
                            <ArrowIcon className="icon icon--caret-down" />
                        ) : (
                            <ArrowIcon className="icon icon--caret-right" />
                        )}
                    </FlexDiv>
                </Container>
            )}
            {isMobile && <Separator />}
            {(open || isMobile) && (
                <>
                    {Object.values(GlobalFiltersEnum).map((filterItem) => {
                        return (
                            <Container
                                key={filterItem}
                                className={globalFilter === filterItem ? 'selected' : ''}
                                onClick={() => {
                                    setGlobalFilter(filterItem);
                                    setGlobalFilterParam(filterItem);
                                }}
                            >
                                <Filter>
                                    <FilterIcon className={`icon ${getIcon(filterItem)}`} />
                                    <Label>{t(`market.filter-label.global.${filterItem.toLowerCase()}`)}</Label>
                                </Filter>
                            </Container>
                        );
                    })}
                </>
            )}
            {isMobile && <Separator />}
        </Wrapper>
    );
};

const getIcon = (filter: GlobalFiltersEnum) => {
    return filter === GlobalFiltersEnum.OpenMarkets
        ? `icon--logo`
        : filter === GlobalFiltersEnum.PendingMarkets
        ? `icon--ongoing`
        : filter === GlobalFiltersEnum.Canceled
        ? `icon--pause`
        : 'icon--double-check';
};

const Wrapper = styled.div`
    border-bottom: 1px solid ${(props) => props.theme.borderColor.quinary};
    padding-bottom: 5px;
    margin-bottom: 10px;
    @media (max-width: 950px) {
        margin-bottom: 0;
        border-bottom: none;
    }
`;

const Container = styled(FlexDivSpaceBetween)`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    position: relative;
    color: ${(props) => props.theme.textColor.quinary};
    margin-bottom: 5px;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        font-size: 14px;
        line-height: 18px;
        height: 30px;
        color: ${(props) => props.theme.textColor.primary};
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

const Icon = styled.i`
    font-size: 22px;
    margin-right: 10px;
`;

const ArrowIcon = styled.i`
    font-size: 14px;
    text-transform: none;
    font-weight: 400;
`;

const Filter = styled(FlexDiv)`
    padding-left: 10px;
    @media (max-width: 950px) {
        padding-left: 0px;
    }
`;

const FilterIcon = styled.i`
    font-size: 20px;
    font-weight: 400;
    text-transform: none;
    margin-right: 10px;
    @media (max-width: 950px) {
        font-size: 22px;
        margin-right: 18px;
    }
`;

const Separator = styled.div`
    height: 2px;
    margin-top: 15px;
    margin-bottom: 15px;
    background: ${(props) => props.theme.textColor.septenary};
    border-radius: 5px;
`;

export default GlobalFilters;

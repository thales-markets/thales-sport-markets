import { StatusFilter } from 'enums/markets';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getStatusFilter, setStatusFilter } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDiv, FlexDivSpaceBetween } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';

const StatusFilters: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isMobile = useSelector(getIsMobile);
    const statusFilter = useSelector(getStatusFilter);
    const [, setStatusParam] = useQueryParam('status', '');
    const [open, setOpen] = useState(statusFilter !== StatusFilter.OPEN_MARKETS);

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
                    {Object.values(StatusFilter).map((filterItem) => {
                        return (
                            <Container
                                key={filterItem}
                                className={statusFilter === filterItem ? 'selected' : ''}
                                onClick={() => {
                                    dispatch(setStatusFilter(filterItem));
                                    setStatusParam(filterItem);
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

const getIcon = (filter: StatusFilter) => {
    return filter === StatusFilter.OPEN_MARKETS
        ? `icon--logo`
        : filter === StatusFilter.ONGOING_MARKETS
        ? `icon--ongoing`
        : filter === StatusFilter.PAUSED_MARKETS
        ? `icon--pause`
        : filter === StatusFilter.CANCELLED_MARKETS
        ? 'icon--lost'
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
    font-weight: 400;
    margin-left: 1px;
    margin-top: -2px;
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
        margin-left: 1px;
    }
`;

const Separator = styled.div`
    height: 2px;
    margin-top: 15px;
    margin-bottom: 15px;
    background: ${(props) => props.theme.textColor.septenary};
    border-radius: 5px;
`;

export default StatusFilters;

import OutsideClickHandler from 'components/OutsideClick';
import Tooltip from 'components/Tooltip';
import { ODDS_TYPES } from 'constants/markets';
import { OddsType, SortType, SportFilter } from 'enums/markets';
import { t } from 'i18next';
import TimeFilters from 'layouts/DappLayout/DappHeader/components/TimeFilters';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getDatePeriodFilter,
    getIsThreeWayView,
    getMarketTypeFilter,
    getSelectedMarket,
    getSortType,
    getSportFilter,
    setIsThreeWayView,
    setSortType,
} from 'redux/modules/market';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import {
    Divider,
    DropDown,
    DropdownContainer,
    DropDownItem,
    FilterContainer,
    HeaderIcon,
    SettingsContainer,
    SettingsWrapper,
    SortIndicator,
    SortMenu,
    SortMenuItem,
    SortSelector,
    SwitchContainer,
    ThreeWayIcon,
    TimeContainer,
    TimeFiltersDropdown,
} from '../Header/styled-components';

type FiltersProps = {
    isMainPageView?: boolean;
};

const Filters: React.FC<FiltersProps> = ({ isMainPageView }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const isThreeWayView = useSelector(getIsThreeWayView);
    const selectedSortType = useSelector(getSortType);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const selectedMarket = useSelector(getSelectedMarket);
    const sportFilter = useSelector(getSportFilter);
    const isMobile = useSelector(getIsMobile);

    const [openSortMenu, setOpenSortMenu] = useState(false);
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [timeFiltersOpen, setTimeFiltersOpen] = useState<boolean>(false);

    const isQuickSgpMarket = useMemo(() => sportFilter === SportFilter.QuickSgp, [sportFilter]);

    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    return (
        <FilterContainer>
            {!isMobile && !isQuickSgpMarket && !selectedMarket && marketTypeFilter === undefined && (
                <>
                    <SwitchContainer>
                        <Tooltip
                            overlay={
                                isThreeWayView
                                    ? t('common.filter.tooltip.standard-view')
                                    : t('common.filter.tooltip.column-view')
                            }
                        >
                            <ThreeWayIcon
                                onClick={() => {
                                    if (!selectedMarket && marketTypeFilter === undefined) {
                                        dispatch(setIsThreeWayView(!isThreeWayView));
                                    }
                                }}
                                className={`icon ${isThreeWayView ? 'icon--list' : 'icon--grid'}`}
                                disabled={!!selectedMarket || marketTypeFilter !== undefined}
                            />
                        </Tooltip>
                    </SwitchContainer>
                    <Divider />
                </>
            )}
            {isMainPageView && (
                <>
                    <SortSelector>
                        <OutsideClickHandler onOutsideClick={() => setOpenSortMenu(false)}>
                            <Tooltip overlay={isMobile ? '' : t('common.filter.tooltip.sorting')}>
                                <SortIndicator
                                    className={'icon icon--sorting'}
                                    onClick={() => setOpenSortMenu(!openSortMenu)}
                                />
                            </Tooltip>
                            {openSortMenu && (
                                <SortMenu>
                                    {Object.values(SortType)
                                        .filter((_, i) => i < Object.values(SortType).length)
                                        .map((sortType, index) => {
                                            const isSelected = selectedSortType === (sortType as SortType);
                                            return (
                                                <SortMenuItem
                                                    key={`sortMenuItem${index}`}
                                                    isSelected={isSelected}
                                                    onClick={() => {
                                                        !isSelected && dispatch(setSortType(sortType as SortType));
                                                        setOpenSortMenu(false);
                                                    }}
                                                >
                                                    {sortType}
                                                </SortMenuItem>
                                            );
                                        })}
                                </SortMenu>
                            )}
                        </OutsideClickHandler>
                    </SortSelector>
                    <Divider />
                </>
            )}

            <OutsideClickHandler onOutsideClick={() => setTimeFiltersOpen(false)}>
                <TimeContainer
                    onClick={() => {
                        setTimeFiltersOpen(!timeFiltersOpen);
                    }}
                >
                    <SettingsWrapper>
                        <Tooltip overlay={isMobile ? '' : t('common.filter.tooltip.date')}>
                            <FlexDivCentered gap={2}>
                                <HeaderIcon
                                    iconColor={datePeriodFilter > 0 ? theme.textColor.quaternary : ''}
                                    className="icon icon--clock"
                                />
                                {datePeriodFilter > 0 ? <Label active>{datePeriodFilter}H </Label> : <Label>ALL</Label>}
                            </FlexDivCentered>
                        </Tooltip>

                        {timeFiltersOpen && (
                            <TimeFiltersDropdown>
                                <DropDown>
                                    <TimeFilters />
                                </DropDown>
                            </TimeFiltersDropdown>
                        )}
                    </SettingsWrapper>
                </TimeContainer>
            </OutsideClickHandler>

            <Divider />

            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <SettingsContainer
                    onClick={() => {
                        setDropdownIsOpen(!dropdownIsOpen);
                    }}
                >
                    <SettingsWrapper>
                        <Tooltip overlay={isMobile ? '' : t('common.filter.tooltip.odds')}>
                            <FlexDivCentered gap={2}>
                                <HeaderIcon className="icon icon--settings" />
                                <Label>{t(`common.odds.${selectedOddsType}`)}</Label>
                            </FlexDivCentered>
                        </Tooltip>

                        {dropdownIsOpen && (
                            <DropdownContainer>
                                <DropDown>
                                    {ODDS_TYPES.map((item: OddsType, index: number) => {
                                        return (
                                            <DropDownItem
                                                key={index}
                                                isSelected={selectedOddsType === item}
                                                onClick={() => {
                                                    setSelectedOddsType(item);
                                                    setDropdownIsOpen(false);
                                                }}
                                            >
                                                <FlexDivCentered>
                                                    <Odds>{t(`common.odds.${item}`)}</Odds>
                                                </FlexDivCentered>
                                            </DropDownItem>
                                        );
                                    })}
                                </DropDown>
                            </DropdownContainer>
                        )}
                    </SettingsWrapper>
                </SettingsContainer>
            </OutsideClickHandler>
        </FilterContainer>
    );
};

const Label = styled.span<{ active?: boolean }>`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    display: block;
    text-transform: uppercase;
    white-space: pre;
`;

const Odds = styled.div`
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: ${(props) => props.theme.textColor.primary};
    display: block;
    text-transform: capitalize;
    white-space: pre;
`;

export default Filters;

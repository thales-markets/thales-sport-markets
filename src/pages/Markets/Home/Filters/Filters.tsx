import OutsideClickHandler from 'components/OutsideClick';
import Tooltip from 'components/Tooltip';
import { ODDS_TYPES } from 'constants/markets';
import { OddsType, SortType } from 'enums/markets';
import { t } from 'i18next';
import TimeFilters from 'layouts/DappLayout/DappHeader/components/TimeFilters';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getDatePeriodFilter,
    getIsThreeWayView,
    getMarketTypeFilter,
    getSelectedMarket,
    getSortType,
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
    SortIndicator,
    SortMenu,
    SortMenuItem,
    SortSelector,
    SwitchContainer,
    ThreeWayIcon,
    TimeContainer,
} from '../Header/styled-components';

type FiltersProps = {
    hideSwitch?: boolean;
    isMainPageView?: boolean;
};

const Filters: React.FC<FiltersProps> = ({ hideSwitch, isMainPageView }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const isThreeWayView = useSelector(getIsThreeWayView);
    const selectedSortType = useSelector(getSortType);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const selectedMarket = useSelector(getSelectedMarket);
    const isMobile = useSelector(getIsMobile);

    const [openSortMenu, setOpenSortMenu] = useState(false);
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [timeFiltersOpen, setTimeFiltersOpen] = useState<boolean>(false);

    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    return (
        <FilterContainer>
            {!hideSwitch && !selectedMarket && marketTypeFilter === undefined && (
                <>
                    <SwitchContainer>
                        <Tooltip overlay={isThreeWayView ? 'Switch to standard view' : 'Switch to three column view'}>
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
                            <Tooltip overlay={isMobile ? '' : 'Select games sorting'}>
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
                    <Tooltip overlay={isMobile ? '' : 'Select date range'}>
                        <FlexDivCentered gap={2}>
                            <HeaderIcon
                                iconColor={datePeriodFilter > 0 ? theme.textColor.quaternary : ''}
                                className="icon icon--clock"
                            />
                            {datePeriodFilter > 0 ? <Label active>{datePeriodFilter}H </Label> : <Label>ALL</Label>}
                        </FlexDivCentered>
                    </Tooltip>

                    {timeFiltersOpen && (
                        <DropdownContainer>
                            <DropDown>
                                <TimeFilters />
                            </DropDown>
                        </DropdownContainer>
                    )}
                </TimeContainer>
            </OutsideClickHandler>

            <Divider />

            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <SettingsContainer
                    onClick={() => {
                        setDropdownIsOpen(!dropdownIsOpen);
                    }}
                >
                    <Tooltip overlay={isMobile ? '' : 'Select odds format'}>
                        <FlexDivCentered gap={2}>
                            <HeaderIcon className="icon icon--settings" />
                            <Label>{selectedOddsType} </Label>
                        </FlexDivCentered>
                    </Tooltip>

                    {dropdownIsOpen && (
                        <DropdownContainer>
                            <DropDown>
                                {ODDS_TYPES.map((item: OddsType, index: number) => {
                                    console.log(item);
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
                                                <Odds> {t(`common.odds.${item}`)}</Odds>
                                            </FlexDivCentered>
                                        </DropDownItem>
                                    );
                                })}
                            </DropDown>
                        </DropdownContainer>
                    )}
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

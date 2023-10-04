import { USD_SIGN } from 'constants/currency';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useMemo, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
    FlexDivSpaceBetween,
    FlexDivColumnCentered,
    FlexDivRowCentered,
    FlexDivStart,
    FlexDivCentered,
} from 'styles/common';
import { Coins } from 'types/tokens';
import { isStableCurrency } from 'utils/collaterals';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { setPaymentSelectedStableIndex } from 'redux/modules/parlay';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    disabled?: boolean;
    isDetailedView?: boolean;
    collateralBalances?: any;
    exchangeRates?: Rates | null;
    dropDownWidth?: string;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    disabled,
    isDetailedView,
    collateralBalances,
    exchangeRates,
    dropDownWidth,
}) => {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (collateralBalances ? collateralBalances[collateral] : 0) *
            (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0),
        [collateralBalances, exchangeRates]
    );

    const collateralsDetailsSorted = useMemo(() => {
        const mappedCollaterals = collateralArray.map((collateral, index) => ({ name: collateral as Coins, index }));
        if (!isDetailedView) {
            return mappedCollaterals;
        }
        return mappedCollaterals.sort(
            (collateralA, collateralB) => getUSDForCollateral(collateralB.name) - getUSDForCollateral(collateralA.name)
        );
    }, [collateralArray, isDetailedView, getUSDForCollateral]);

    return (
        <Container>
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <SelectedCollateral disabled={!!disabled} onClick={() => !disabled && setOpen(!open)}>
                    <TextCollateralWrapper>
                        <TextCollateral lineHeight="14px">{collateralArray[selectedItem]}</TextCollateral>
                    </TextCollateralWrapper>
                    <Arrow
                        className={open ? `icon-thales icon-thales--caret-up` : `icon-thales icon-thales--caret-down`}
                    />
                </SelectedCollateral>
                {isDetailedView
                    ? open && (
                          <DetailedDropdown width={dropDownWidth} onClick={() => setOpen(!open)}>
                              {collateralsDetailsSorted.map((collateral, i) => {
                                  return (
                                      <DetailedCollateralOption
                                          key={i}
                                          onClick={() => {
                                              onChangeCollateral(collateral.index);
                                              dispatch(setPaymentSelectedStableIndex(collateral.index));
                                          }}
                                      >
                                          <FlexDivCentered>
                                              <Icon
                                                  className={`currency-icon currency-icon--${collateral.name.toLowerCase()}`}
                                              />
                                              <TextCollateral fontWeight="400">{collateral.name}</TextCollateral>
                                          </FlexDivCentered>
                                          <div>
                                              <TextCollateral fontWeight="400">
                                                  {formatCurrencyWithSign(
                                                      null,
                                                      collateralBalances ? collateralBalances[collateral.name] : 0
                                                  )}
                                              </TextCollateral>
                                              <TextCollateral fontWeight="800">
                                                  {!exchangeRates?.[collateral.name] &&
                                                  !isStableCurrency(collateral.name as Coins)
                                                      ? '...'
                                                      : ` (${formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            getUSDForCollateral(collateral.name as Coins)
                                                        )})`}
                                              </TextCollateral>
                                          </div>
                                      </DetailedCollateralOption>
                                  );
                              })}
                          </DetailedDropdown>
                      )
                    : open && (
                          <Dropdown width={dropDownWidth} onClick={() => setOpen(!open)}>
                              {collateralArray.map((collateral, index) => {
                                  return (
                                      <CollateralOption
                                          key={index}
                                          onClick={() => {
                                              onChangeCollateral(index);
                                              dispatch(setPaymentSelectedStableIndex(index));
                                          }}
                                      >
                                          <TextCollateral>{collateral}</TextCollateral>
                                      </CollateralOption>
                                  );
                              })}
                          </Dropdown>
                      )}
            </OutsideClickHandler>
        </Container>
    );
};

const Container = styled(FlexDivStart)`
    margin: 0 7px;
    align-items: center;
`;

const Text = styled.span<{ fontWeight?: string; lineHeight?: string }>`
    font-style: normal;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '600')};
    font-size: 14px;
    line-height: ${(props) => props.lineHeight || '20px'};
`;

const TextCollateral = styled(Text)`
    color: ${(props) => props.theme.input.textColor.primary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const TextCollateralWrapper = styled.div`
    min-width: 45px;
`;

const Arrow = styled.i`
    font-size: 10px;
    text-transform: none;
    color: ${(props) => props.theme.input.textColor.primary};
`;

const SelectedCollateral = styled(FlexDivRowCentered)<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const Dropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    margin-top: 10px;
    margin-left: -10px;
    width: ${(props) => (props.width ? props.width : '71px')};
    padding: 5px 3px;
    border-radius: 8px;
    background: ${(props) => props.theme.input.background.primary};
    z-index: 100;
`;

const DetailedDropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    top: 35px;
    right: 0px;
    width: ${(props) => (props.width ? props.width : '350px')};
    padding: 5px 3px;
    border-radius: 8px;
    background: ${(props) => props.theme.input.background.primary};
    z-index: 100;
`;

const CollateralOption = styled.div`
    display: flex;
    align-items: center;
    padding: 5px 7px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.input.background.selection.primary};
    }
`;

const DetailedCollateralOption = styled(FlexDivSpaceBetween)`
    padding: 5px 15px;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        background: rgb(95, 97, 128, 0.5);
    }
`;

const Icon = styled.i`
    font-size: 25px;
    line-height: 100%;
    margin-right: 10px;
    color: ${(props) => props.theme.input.textColor.primary};
`;

export default CollateralSelector;

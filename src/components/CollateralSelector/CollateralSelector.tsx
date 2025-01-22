import OutsideClickHandler from 'components/OutsideClick';
import { USD_SIGN } from 'constants/currency';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumnCentered,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';
import { Coins, formatCurrencyWithSign } from 'thales-utils';
import { Rates } from 'types/collateral';
import { isStableCurrency } from 'utils/collaterals';
import { getNetworkNameByNetworkId } from 'utils/network';
import { useChainId } from 'wagmi';
import { setPaymentSelectedCollateralIndex } from '../../redux/modules/ticket';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    disabled?: boolean;
    isDetailedView?: boolean;
    hideCollateralNameOnInput?: boolean;
    hideBalance?: boolean;
    collateralBalances?: any;
    exchangeRates?: Rates | null;
    dropDownWidth?: string;
    showCollateralImg?: boolean;
    stretch?: boolean;
    showNetworkName?: boolean;
    preventPaymentCollateralChange?: boolean;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    disabled,
    isDetailedView,
    hideCollateralNameOnInput,
    hideBalance,
    collateralBalances,
    exchangeRates,
    dropDownWidth,
    showCollateralImg,
    stretch,
    showNetworkName,
    preventPaymentCollateralChange,
}) => {
    const dispatch = useDispatch();

    const networkId = useChainId();

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
        <Container stretch={stretch} isDetailedView={isDetailedView}>
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <SelectedCollateral stretch={stretch} disabled={!!disabled} onClick={() => !disabled && setOpen(!open)}>
                    <TextCollateralWrapper isDetailedView={isDetailedView}>
                        {showCollateralImg && collateralArray[selectedItem] && (
                            <Icon
                                className={`currency-icon currency-icon--${collateralArray[
                                    selectedItem
                                ].toLowerCase()}`}
                            />
                        )}
                        <TextCollateral isDetailedView={isDetailedView} isSelectedCollateral={true}>
                            {!hideCollateralNameOnInput && collateralArray[selectedItem]}
                            {showNetworkName && ` (${getNetworkNameByNetworkId(networkId, true)})`}
                        </TextCollateral>
                    </TextCollateralWrapper>
                    <Arrow
                        className={open ? `icon icon--caret-up` : `icon icon--caret-down`}
                        isDetailedView={isDetailedView}
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
                                              if (!preventPaymentCollateralChange) {
                                                  dispatch(
                                                      setPaymentSelectedCollateralIndex({
                                                          selectedCollateralIndex: collateral.index,
                                                          networkId: networkId,
                                                          forcedChange: true,
                                                      })
                                                  );
                                              }
                                          }}
                                      >
                                          <FlexDivCentered>
                                              <Icon
                                                  className={`currency-icon currency-icon--${collateral.name.toLowerCase()}`}
                                              />
                                              <TextCollateral fontWeight="600" isDetailedView={true}>
                                                  {collateral.name}
                                              </TextCollateral>
                                          </FlexDivCentered>
                                          {!hideBalance && (
                                              <div>
                                                  <TextCollateral fontWeight="400" isDetailedView={true}>
                                                      {formatCurrencyWithSign(
                                                          null,
                                                          collateralBalances ? collateralBalances[collateral.name] : 0
                                                      )}
                                                  </TextCollateral>
                                                  <TextCollateral fontWeight="600" isDetailedView={true}>
                                                      {!exchangeRates?.[collateral.name] &&
                                                      !isStableCurrency(collateral.name as Coins)
                                                          ? '...'
                                                          : ` (${formatCurrencyWithSign(
                                                                USD_SIGN,
                                                                getUSDForCollateral(collateral.name as Coins)
                                                            )})`}
                                                  </TextCollateral>
                                              </div>
                                          )}
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
                                              if (!preventPaymentCollateralChange) {
                                                  dispatch(
                                                      setPaymentSelectedCollateralIndex({
                                                          selectedCollateralIndex: index,
                                                          networkId: networkId,
                                                          forcedChange: true,
                                                      })
                                                  );
                                              }
                                          }}
                                      >
                                          <TextCollateral fontWeight="600">{collateral}</TextCollateral>
                                      </CollateralOption>
                                  );
                              })}
                          </Dropdown>
                      )}
            </OutsideClickHandler>
        </Container>
    );
};

const Container = styled(FlexDivStart)<{ stretch?: boolean; isDetailedView?: boolean }>`
    margin: ${(props) => (props.isDetailedView ? '0 7px' : '0')};
    align-items: center;
    width: ${(props) => (props.stretch ? '100%' : '')};
`;

const Text = styled.span<{
    fontWeight?: string;
    isDetailedView?: boolean;
    isSelectedCollateral?: boolean;
}>`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-style: normal;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '600')};
    font-size: ${(props) => (props.isDetailedView ? '14px' : '12px')};
    ${(props) => (props.isSelectedCollateral ? `line-height: ${props.isDetailedView ? '15px' : '12px'};` : '')}
    @media (max-width: 767px) {
        ${(props) => (!props.isDetailedView && props.isSelectedCollateral ? 'font-size: 10px;' : '')}
        ${(props) => (!props.isDetailedView && props.isSelectedCollateral ? 'line-height: 10px;' : '')}
    }
`;

const TextCollateral = styled(Text)`
    color: ${(props) =>
        props.isDetailedView
            ? props.theme.input.textColor.tertiary
            : props.isSelectedCollateral
            ? props.theme.status.win
            : props.theme.textColor.tertiary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const TextCollateralWrapper = styled.div<{ isDetailedView?: boolean }>`
    min-width: ${(props) => (props.isDetailedView ? '52px' : '45px')};
    display: flex;
    align-items: center;
    @media (max-width: 767px) {
        ${(props) => (!props.isDetailedView ? 'min-width: 35px;' : '')}
    }
`;

const Arrow = styled.i<{
    isDetailedView?: boolean;
}>`
    font-size: 10px;
    text-transform: none;
    color: ${(props) => (props.isDetailedView ? props.theme.input.textColor.tertiary : props.theme.status.win)};
`;

const SelectedCollateral = styled(FlexDivRowCentered)<{ disabled: boolean; stretch?: boolean }>`
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
    justify-content: ${(props) => (props.stretch ? 'space-between' : '')};
    width: ${(props) => (props.stretch ? '100%' : '')}; ;
`;

const Dropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    margin-top: 6px;
    margin-left: -16px;
    width: ${(props) => (props.width ? props.width : '71px')};
    padding: 5px 3px;
    border-radius: 8px;
    background: ${(props) => props.theme.status.win};
    z-index: 100;
    border: 2px solid ${(props) => props.theme.status.win};
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
`;

const DetailedDropdown = styled(FlexDivColumnCentered)<{ width?: string }>`
    position: absolute;
    top: 35px;
    right: 0px;
    width: ${(props) => (props.width ? props.width : '350px')};
    padding: 5px 3px;
    border-radius: 8px;
    background: ${(props) => props.theme.input.background.tertiary};
    z-index: 100;
    border: 2px solid ${(props) => props.theme.input.borderColor.tertiary};
`;

const CollateralOption = styled.div`
    display: flex;
    align-items: center;
    padding: 5px 7px;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid ${(props) => props.theme.status.win};
    &:hover {
        background: #1cb169;
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
    color: ${(props) => props.theme.input.textColor.tertiary};
`;

export default CollateralSelector;

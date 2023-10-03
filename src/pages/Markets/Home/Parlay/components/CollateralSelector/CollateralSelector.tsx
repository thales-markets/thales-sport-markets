import { ReactComponent as OvertimeVoucherIcon } from 'assets/images/overtime-voucher.svg';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { Coins, OvertimeVoucher } from 'types/tokens';
import { getCollateralIndexForNetwork, getStableIcon } from 'utils/collaterals';
import { formatCurrency } from 'utils/formatters/number';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getParlayPayment, setPaymentIsVoucherSelected, setPaymentSelectedStableIndex } from 'redux/modules/parlay';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    overtimeVoucher?: OvertimeVoucher;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({ collateralArray, overtimeVoucher }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const parlayPayment = useSelector(getParlayPayment);

    const isVoucherSelected = parlayPayment.isVoucherSelected;
    const selectedStableIndex = parlayPayment.selectedStableIndex;

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const isMultiColletaralSupported = getIsMultiCollateralSupported(networkId);

    const stableBalances = useMemo(() => {
        return multipleCollateralBalances.data;
    }, [multipleCollateralBalances.data]);

    return (
        <Container>
            <AssetContainer hasMoreThenTwoCollaterals={isMultiColletaralSupported}>
                {overtimeVoucher && (
                    <CollateralContainer hasMoreThenTwoCollaterals={isMultiColletaralSupported}>
                        <CollateralName selected={isVoucherSelected} uppercase={true}>
                            {t('common.voucher.voucher')}
                        </CollateralName>
                        <CollateralIcon>
                            <StyledOvertimeVoucherIcon
                                onClick={() => {
                                    dispatch(setPaymentIsVoucherSelected(true));
                                    dispatch(setPaymentSelectedStableIndex(0));
                                }}
                                $isActive={isVoucherSelected}
                            />
                        </CollateralIcon>
                        <CollateralBalance selected={isVoucherSelected}>
                            {formatCurrency(overtimeVoucher.remainingAmount, 0)}
                        </CollateralBalance>
                    </CollateralContainer>
                )}
                {collateralArray.length &&
                    collateralArray.map((item) => {
                        const index = getCollateralIndexForNetwork(networkId, item as Coins);
                        const AssetIcon = getStableIcon(item as Coins);
                        return (
                            <CollateralContainer
                                key={index + 'container'}
                                hasMoreThenTwoCollaterals={isMultiColletaralSupported}
                            >
                                <CollateralName selected={selectedStableIndex == index && !isVoucherSelected}>
                                    {item}
                                </CollateralName>
                                <CollateralIcon key={index}>
                                    <AssetIcon
                                        key={index}
                                        onClick={() => {
                                            dispatch(setPaymentIsVoucherSelected(false));
                                            dispatch(setPaymentSelectedStableIndex(index));
                                        }}
                                        style={{
                                            opacity: selectedStableIndex == index && !isVoucherSelected ? '1' : '0.5',
                                            marginRight: 7,
                                            width: '25px',
                                            height: '25px',
                                        }}
                                    />
                                </CollateralIcon>
                                <CollateralBalance selected={selectedStableIndex == index && !isVoucherSelected}>
                                    {formatCurrency(stableBalances ? stableBalances[item as Coins] : 0)}
                                </CollateralBalance>
                            </CollateralContainer>
                        );
                    })}
            </AssetContainer>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
    align-items: center;
    @media (max-width: 950px) {
        justify-content: center;
        flex-direction: column;
    }
`;

const AssetContainer = styled.div<{ hasMoreThenTwoCollaterals?: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: ${(_props) => (_props?.hasMoreThenTwoCollaterals == true ? 'space-between' : 'flex-start')};
    width: 100%;
`;

const CollateralName = styled.span<{ selected?: boolean; uppercase?: boolean }>`
    font-weight: 700;
    font-size: 10px;
    line-height: 150%;
    margin-bottom: 5px;
    color: white;
    ${(props) => (props?.selected ? `opacity: 1;` : `opacity: 0.5`)};
    ${(props) => (props?.uppercase ? `text-transform: uppercase;` : '')};
`;

const CollateralIcon = styled.div`
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
    margin-bottom: 5px;
`;

const CollateralContainer = styled.div<{ hasMoreThenTwoCollaterals?: boolean }>`
    display: flex;
    flex-direction: column;
    ${(_props) => (_props?.hasMoreThenTwoCollaterals == true ? '' : `padding-right: 20px;`)}
    align-items: center;
`;

const CollateralBalance = styled.span<{ selected?: boolean }>`
    font-weight: 400;
    font-size: 10px;
    line-height: 150%;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props?.selected ? `opacity: 1;` : `opacity: 0.5`)};
`;

const StyledOvertimeVoucherIcon = styled(OvertimeVoucherIcon)<{ $isActive: boolean }>`
    margin-right: 7px;
    width: 25px;
    height: 25px;
    opacity: ${(props) => (props.$isActive ? '1' : '0.5')};
`;

export default CollateralSelector;

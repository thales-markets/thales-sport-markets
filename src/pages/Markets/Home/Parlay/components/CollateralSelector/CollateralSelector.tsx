import { ReactComponent as OvertimeVoucherIcon } from 'assets/images/overtime-voucher.svg';
import OvertimeVoucherPopup from 'components/OvertimeVoucherPopup';
import Tooltip from 'components/Tooltip';
import { PAYMENT_CURRENCY } from 'constants/currency';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { OvertimeVoucher } from 'types/tokens';
import { getStableIcon, StablecoinKey } from 'utils/collaterals';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
    overtimeVoucher?: OvertimeVoucher;
    isVoucherSelected: boolean;
    setIsVoucherSelected: any;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
    overtimeVoucher,
    isVoucherSelected,
    setIsVoucherSelected,
}) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const stableBalances = useMemo(() => {
        return multipleStableBalances.data;
    }, [multipleStableBalances.data]);

    return (
        <Container>
            <AssetContainer>
                {overtimeVoucher && (
                    <Tooltip
                        overlay={
                            <OvertimeVoucherPopup
                                title={t('common.voucher.overtime-voucher')}
                                imageSrc={overtimeVoucher.image}
                                text={`${t('common.voucher.remaining-amount')}: ${formatCurrencyWithKey(
                                    PAYMENT_CURRENCY,
                                    overtimeVoucher.remainingAmount
                                )}`}
                            />
                        }
                        component={
                            <CollateralContainer>
                                <CollateralName selected={isVoucherSelected} uppercase={true}>
                                    {t('common.voucher.voucher')}
                                </CollateralName>
                                <CollateralIcon active={isVoucherSelected}>
                                    <OvertimeVoucherIcon
                                        onClick={() => {
                                            setIsVoucherSelected(true);
                                            onChangeCollateral(0);
                                        }}
                                        style={{
                                            ...(isVoucherSelected
                                                ? {
                                                      opacity: '1',
                                                  }
                                                : {
                                                      opacity: '0.5',
                                                  }),
                                            marginRight: 7,
                                            width: '25px',
                                            height: '25px',
                                        }}
                                    />
                                </CollateralIcon>
                                <CollateralBalance selected={isVoucherSelected}>
                                    {formatCurrency(overtimeVoucher.remainingAmount, 0)}
                                </CollateralBalance>
                            </CollateralContainer>
                        }
                        overlayClassName="overtime-voucher-overlay"
                    />
                )}
                {collateralArray.length &&
                    collateralArray.map((item, index) => {
                        const AssetIcon = getStableIcon(item as StablecoinKey);
                        return (
                            <CollateralContainer key={index + 'container'}>
                                <CollateralName selected={selectedItem == index && !isVoucherSelected}>
                                    {item}
                                </CollateralName>
                                <CollateralIcon active={selectedItem == index} key={index}>
                                    <AssetIcon
                                        key={index}
                                        onClick={() => {
                                            setIsVoucherSelected(false);
                                            onChangeCollateral(index);
                                        }}
                                        style={{
                                            ...(selectedItem == index && !isVoucherSelected
                                                ? {
                                                      opacity: '1',
                                                  }
                                                : {
                                                      opacity: '0.5',
                                                  }),
                                            marginRight: 7,
                                            width: '25px',
                                            height: '25px',
                                        }}
                                    />
                                </CollateralIcon>
                                <CollateralBalance selected={selectedItem == index && !isVoucherSelected}>
                                    {formatCurrency(stableBalances ? stableBalances[item as StablecoinKey] : 0, 0)}
                                </CollateralBalance>
                            </CollateralContainer>
                        );
                    })}
            </AssetContainer>
        </Container>
    );
};

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
    align-items: center;
    @media (max-width: 950px) {
        justify-content: center;
        flex-direction: column;
    }
`;

const AssetContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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

const CollateralIcon = styled.div<{ active?: boolean }>`
    width: 25px;
    height: 25px;
    border-radius: 50%;
    box-shadow: ${(props) => (props?.active ? 'var(--shadow)' : '')};
    cursor: pointer;
    margin-bottom: 5px;
`;

const CollateralContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CollateralBalance = styled.span<{ selected?: boolean }>`
    font-weight: 400;
    font-size: 10px;
    line-height: 150%;
    color: #ffffff;
    ${(props) => (props?.selected ? `opacity: 1;` : `opacity: 0.5`)};
`;

export default CollateralSelector;

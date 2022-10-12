import React, { useMemo } from 'react';
import {
    AssetContainer,
    CollateralContainer,
    CollateralIcon,
    CollateralName,
    Container,
    StableBalance,
    TokenBalance,
} from './styled-components';
// import CurrencyIcon from 'components/Currency/v2/CurrencyIcon';
import { getStableIcon, StablecoinKey } from 'utils/collaterals';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { OvertimeVoucher } from 'types/tokens';
import { ReactComponent as OvertimeVoucherIcon } from 'assets/images/overtime-voucher.svg';
import OvertimeVoucherPopup from 'components/OvertimeVoucherPopup';
import Tooltip from 'components/Tooltip';
import { PAYMENT_CURRENCY } from 'constants/currency';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';

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
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const stableBalances = useMemo(() => {
        return multipleStableBalances.data;
    }, [multipleStableBalances.data]);

    console.log('stableBalances ', stableBalances);

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
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />
                                </CollateralIcon>
                                <TokenBalance>{formatCurrency(overtimeVoucher.remainingAmount, 2)}</TokenBalance>
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
                                <CollateralName>{item}</CollateralName>
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
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />
                                </CollateralIcon>
                                <StableBalance>
                                    {formatCurrency(stableBalances ? stableBalances[item as StablecoinKey] : 0, 1)}
                                </StableBalance>
                            </CollateralContainer>
                        );
                    })}
            </AssetContainer>
        </Container>
    );
};

export default CollateralSelector;

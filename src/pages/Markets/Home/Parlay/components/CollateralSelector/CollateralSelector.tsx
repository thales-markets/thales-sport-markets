import { ReactComponent as OvertimeVoucherIcon } from 'assets/images/overtime-voucher.svg';
import OvertimeVoucherPopup from 'components/OvertimeVoucherPopup';
import Tooltip from 'components/Tooltip';
import { PAYMENT_CURRENCY } from 'constants/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { OvertimeVoucher } from 'types/tokens';
import { getStableIcon, StablecoinKey } from 'utils/collaterals';
import { formatCurrencyWithKey } from 'utils/formatters/number';

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
                                            width: '25px',
                                            height: '25px',
                                        }}
                                    />
                                </CollateralIcon>
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
    margin: 13px 0px;
    align-items: center;
    @media (max-width: 768px) {
        justify-content: center;
        margin-bottom: 20px;
        margin-top: 20px;
        flex-direction: column;
    }
`;

const AssetContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`;

const CollateralIcon = styled.div<{ active?: boolean }>`
    width: 25px;
    height: 25px;
    border-radius: 50%;
    box-shadow: ${(_props) => (_props?.active ? 'var(--shadow)' : '')};
    cursor: pointer;
`;

const CollateralContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export default CollateralSelector;

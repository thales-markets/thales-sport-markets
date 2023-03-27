import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnNative, FlexDivRowCentered } from 'styles/common';
import voucherLogoBox from 'assets/images/voucher/voucher-logo-box.svg';
import voucherAmountBox from 'assets/images/voucher/voucher-amount-box.svg';
import voucherTimeBox from 'assets/images/voucher/voucher-time-box.svg';
import voucherClaimBox from 'assets/images/voucher/voucher-claim-box.svg';
import zebraLogo from 'assets/images/voucher/voucher-zebra-logo.svg';
import overtimeLogo from 'assets/images/overtime-logo.svg';
import useOvertimeVoucherEscrowQuery from 'queries/wallet/useOvertimeVoucherEscrowQuery';
import { getIsAppReady } from 'redux/modules/app';
import { getDefaultColleteralForNetwork } from 'utils/collaterals';
import SimpleLoader from 'components/SimpleLoader';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { getMaxGasLimitForNetwork } from 'utils/network';

const Voucher: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [isClaiming, setIsClaiming] = useState(false);

    const overtimeVoucherEscrowQuery = useOvertimeVoucherEscrowQuery(walletAddress, networkId, {
        enabled: isAppReady,
    });

    const overtimeVoucherEscrowData = overtimeVoucherEscrowQuery.isSuccess ? overtimeVoucherEscrowQuery.data : null;

    const daysLeftToClaim =
        overtimeVoucherEscrowData?.hoursLeftToClaim &&
        Math.floor((overtimeVoucherEscrowData?.hoursLeftToClaim || 0) / 24);

    const claimHandler = useCallback(async () => {
        if (isClaiming) {
            return;
        }
        const { overtimeVoucherEscrowContract, signer } = networkConnector;
        if (overtimeVoucherEscrowContract && signer) {
            const overtimeVoucherEscrowContractWithSigner = overtimeVoucherEscrowContract.connect(signer);
            setIsClaiming(true);
            const id = toast.loading(t('profile.messages.transaction-pending'));
            try {
                const tx = await overtimeVoucherEscrowContractWithSigner.claimVoucher({
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                });
                const txResult = await tx.wait();
                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('profile.messages.voucher-claim-success')));
                    setIsClaiming(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsClaiming(false);
                console.log('Error ', e);
            }
        }
    }, [networkId, t, isClaiming]);

    return (
        <Container>
            {overtimeVoucherEscrowQuery.isLoading ? (
                <SimpleLoader />
            ) : (
                <>
                    <InfoText>{t('profile.voucher-info')}</InfoText>
                    {overtimeVoucherEscrowData?.isClaimable && (
                        <VoucherRow>
                            <VoucherBox width="306px" backgroundImage={voucherLogoBox}>
                                <Logo src={zebraLogo} />
                                <FlexDivColumnNative>
                                    <Logo src={overtimeLogo} width="158px" />
                                    <GiftText isUppercase={true}> {t('profile.gift-voucher')}</GiftText>
                                </FlexDivColumnNative>
                            </VoucherBox>
                            <VoucherBox width="118px" backgroundImage={voucherAmountBox} isColumn={true}>
                                <NumberText>{overtimeVoucherEscrowData?.voucherAmount}</NumberText>
                                <Text>{getDefaultColleteralForNetwork(networkId)}</Text>
                            </VoucherBox>
                            <VoucherBox width="142px" backgroundImage={voucherTimeBox} isColumn={true}>
                                <div>
                                    <NumberText>{daysLeftToClaim}</NumberText>
                                    <DaysText isUppercase={true}>{t('common.time-remaining.days')}</DaysText>
                                </div>
                                <Text isUppercase={true}>{t('profile.left-to-claim')}</Text>
                            </VoucherBox>
                            <ClaimDiv
                                width="205px"
                                backgroundImage={voucherClaimBox}
                                onClick={claimHandler}
                                disabled={isClaiming}
                            >
                                <ClaimText isUppercase={true}>
                                    {isClaiming ? t('profile.claiming-voucher') : t('profile.claim-voucher')}
                                </ClaimText>
                            </ClaimDiv>
                        </VoucherRow>
                    )}
                </>
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    margin-top: 20px;
    max-width: 780px;
`;

const VoucherRow = styled(FlexDivRowCentered)`
    margin-top: 20px;
`;

const VoucherBox = styled(FlexDivCentered)<{ width: string; backgroundImage: string; isColumn?: boolean }>`
    height: 71px;
    width: ${(props) => props.width};
    background: url('${(props) => props.backgroundImage}') no-repeat;
    flex-direction: ${(props) => (props.isColumn ? 'column' : 'row')};
`;

const ClaimDiv = styled(VoucherBox)<{ disabled: boolean }>`
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.8' : '1')};
    &:hover {
        cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
        opacity: 0.8;
    }
`;

const Logo = styled.img<{ width?: string }>`
    ${(props) => (props.width ? `width: ${props.width}` : '')};
`;

const InfoText = styled.p`
    margin: 0 10px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    text-align: justify;
    color: #ffffff;
`;

const Text = styled.span<{ isUppercase?: boolean }>`
    font-style: normal;
    font-weight: 300;
    font-size: 14px;
    line-height: 16px;
    color: #ffffff;
    text-align: center;
    text-transform: ${(props) => (props.isUppercase ? 'uppercase' : 'none')};
`;

const GiftText = styled(Text)`
    white-space: nowrap;
    letter-spacing: 4px;
    margin: 2px 0 0 5px;
`;

const NumberText = styled(Text)`
    font-weight: 800;
    font-size: 40px;
    line-height: 40px;
    color: #3fd1ff;
`;

const DaysText = styled(Text)`
    font-weight: 700;
    font-size: 16px;
    color: #3fd1ff;
    margin-left: 2px;
`;

const ClaimText = styled(Text)`
    font-family: 'Nunito' !important;
    font-weight: 700;
    line-height: 19px;
    letter-spacing: 0.025em;
    color: #303656;
`;

export default Voucher;

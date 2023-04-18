import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivColumnNative,
    FlexDivRowCentered,
} from 'styles/common';
import voucherLogoBox from 'assets/images/voucher/voucher-logo-box.svg';
import voucherAmountBox from 'assets/images/voucher/voucher-amount-box.svg';
import voucherTimeBox from 'assets/images/voucher/voucher-time-box.svg';
import voucherClaimBox from 'assets/images/voucher/voucher-claim-box.svg';
import mobileVoucherInfoBox from 'assets/images/voucher/mobile-voucher-info-box.svg';
import mobileVoucherClaimBox from 'assets/images/voucher/mobile-voucher-claim-box.svg';
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
import { ethers } from 'ethers';
import { refetchAfterVoucherClaim } from 'utils/queryConnector';
import { LINKS } from 'constants/links';
import { generalConfig } from 'config/general';
import { ReactComponent as OvertimeTicket } from 'assets/images/parlay-empty.svg';

const Voucher: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [isClaimable, setIsClaimable] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

    const overtimeVoucherEscrowQuery = useOvertimeVoucherEscrowQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        networkId,
        {
            enabled: isAppReady,
        }
    );

    const overtimeVoucherEscrowData = overtimeVoucherEscrowQuery.isSuccess ? overtimeVoucherEscrowQuery.data : null;

    const timeLeftToClaim = useMemo(() => {
        const hoursLeftToClaim = overtimeVoucherEscrowData?.hoursLeftToClaim || 0;
        const daysLeftToClaim = Math.floor(hoursLeftToClaim / 24);
        return {
            value: daysLeftToClaim < 2 ? hoursLeftToClaim : daysLeftToClaim,
            label:
                daysLeftToClaim < 2
                    ? hoursLeftToClaim === 1
                        ? t('common.time-remaining.hour')
                        : t('common.time-remaining.hours')
                    : t('common.time-remaining.days'),
        };
    }, [overtimeVoucherEscrowData?.hoursLeftToClaim, t]);

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
                    refetchAfterVoucherClaim(walletAddress, networkId);
                    toast.update(id, getSuccessToastOptions(t('profile.messages.voucher-claim-success')));
                    setIsClaiming(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsClaiming(false);
                console.log('Error ', e);
            }
        }
    }, [networkId, t, isClaiming, walletAddress]);

    useEffect(() => {
        setIsClaimable(!!overtimeVoucherEscrowData?.isClaimable);
    }, [networkId, overtimeVoucherEscrowData?.isClaimable]);

    const defaultBannerImageUrl = `${generalConfig.API_URL}/banners/image/voucher.jpg`;
    const mobileDefultBannerImageUrl = `${generalConfig.API_URL}/banners/image/voucher-mobile.jpg`;
    const bannerImageUrlByNetwork = `${generalConfig.API_URL}/banners/image/voucher-${networkId}.jpg`;
    const mobileBannerImageUrlByNetwork = `${generalConfig.API_URL}/banners/image/voucher-mobile-${networkId}.jpg`;

    return (
        <Container>
            {overtimeVoucherEscrowQuery.isLoading ? (
                <SimpleLoader />
            ) : (
                <>
                    <Banner
                        image={bannerImageUrlByNetwork}
                        defaultImage={defaultBannerImageUrl}
                        mobileImage={mobileBannerImageUrlByNetwork}
                        mobileDefaultImage={mobileDefultBannerImageUrl}
                    />
                    <TextWrapper>
                        <Title isUppercase={true}>{t('profile.voucher-title')}</Title>
                        <InfoText>
                            <Trans
                                i18nKey={'profile.voucher-info'}
                                components={{
                                    docsLink: <Link target="_blank" rel="noreferrer" href={LINKS.Profile.Voucher} />,
                                }}
                            />
                        </InfoText>
                    </TextWrapper>
                    {isClaimable ? (
                        <>
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
                                    <TextCenter>
                                        <NumberText>{timeLeftToClaim.value}</NumberText>
                                        <TimeLabel isUppercase={true}>{timeLeftToClaim.label}</TimeLabel>
                                    </TextCenter>
                                    <Text isUppercase={true}>{t('profile.left-to-claim')}</Text>
                                </VoucherBox>
                                <ClaimVoucherBox
                                    width="205px"
                                    backgroundImage={voucherClaimBox}
                                    onClick={claimHandler}
                                    disabled={isClaiming}
                                >
                                    <ClaimText isUppercase={true}>
                                        {isClaiming ? t('profile.claiming-voucher') : t('profile.claim-voucher')}
                                    </ClaimText>
                                </ClaimVoucherBox>
                            </VoucherRow>
                            <MobileVoucherColumn>
                                <VoucherBox
                                    width={MOBILE_VOUCHER_MAX_WIDTH}
                                    height="182px"
                                    backgroundImage={mobileVoucherInfoBox}
                                    isColumn={true}
                                >
                                    <FlexDivRowCentered>
                                        <Logo src={zebraLogo} />
                                        <FlexDivColumnNative>
                                            <Logo src={overtimeLogo} width="158px" />
                                            <GiftText isUppercase={true}> {t('profile.gift-voucher')}</GiftText>
                                        </FlexDivColumnNative>
                                    </FlexDivRowCentered>
                                    <MobileVoucherInfoRow>
                                        <FlexDivColumnNative>
                                            <NumberText>{overtimeVoucherEscrowData?.voucherAmount}</NumberText>
                                            <Text>{getDefaultColleteralForNetwork(networkId)}</Text>
                                        </FlexDivColumnNative>
                                        <FlexDivColumnNative>
                                            <TextCenter>
                                                <NumberText>{timeLeftToClaim.value}</NumberText>
                                                <TimeLabel isUppercase={true}>{timeLeftToClaim.label}</TimeLabel>
                                            </TextCenter>
                                            <Text isUppercase={true}>{t('profile.left-to-claim')}</Text>
                                        </FlexDivColumnNative>
                                    </MobileVoucherInfoRow>
                                </VoucherBox>
                                <ClaimVoucherBox
                                    width={MOBILE_VOUCHER_MAX_WIDTH}
                                    height="81px"
                                    backgroundImage={mobileVoucherClaimBox}
                                    onClick={claimHandler}
                                    disabled={isClaiming}
                                >
                                    <ClaimText isUppercase={true}>
                                        {isClaiming ? t('profile.claiming-voucher') : t('profile.claim-voucher')}
                                    </ClaimText>
                                </ClaimVoucherBox>
                            </MobileVoucherColumn>
                        </>
                    ) : (
                        <EmptyContainer>
                            <EmptyTitle>{t('profile.messages.no-vouchers')}</EmptyTitle>
                            <OvertimeTicket />
                        </EmptyContainer>
                    )}
                </>
            )}
        </Container>
    );
};

const MOBILE_MAX_WIDTH = '450px';
const MOBILE_VOUCHER_MAX_WIDTH = '347px';

const Container = styled(FlexDivColumn)`
    max-width: 780px;
    align-items: center;
    margin: 15px 0;
`;

const Banner = styled.div<{ image: string; defaultImage: string; mobileImage: string; mobileDefaultImage: string }>`
    width: 100%;
    height: 150px;
    background-image: ${(props) => `url(${props.image}), url(${props.defaultImage})`};
    background-position: center;
    border: 2px solid #5f6180;
    border-radius: 14px;
    @media (max-width: ${MOBILE_MAX_WIDTH}) {
        background-image: ${(props) => `url(${props.mobileImage}), url(${props.mobileDefaultImage})`};
    }
`;

const VoucherRow = styled(FlexDivRowCentered)`
    flex-wrap: wrap;
    margin-top: 20px;
    @media (max-width: 780px) {
        justify-content: flex-start;
    }
    @media (max-width: ${MOBILE_MAX_WIDTH}) {
        display: none;
    }
`;

const MobileVoucherColumn = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-top: 10px;
    @media (min-width: 451px) {
        display: none;
    }
`;

const MobileVoucherInfoRow = styled(FlexDivCentered)`
    gap: 80px;
    width: 90%;
    border-top: 1px solid #5f6180;
    margin-top: 10px;
    padding-top: 10px;
`;

const VoucherBox = styled(FlexDivCentered)<{
    width: string;
    height?: string;
    backgroundImage: string;
    isColumn?: boolean;
}>`
    width: ${(props) => props.width};
    height: ${(props) => (props.height ? props.height : '71px')};
    background: url('${(props) => props.backgroundImage}') no-repeat;
    flex-direction: ${(props) => (props.isColumn ? 'column' : 'row')};
    @media (max-width: 780px) {
        margin: 5px 0;
    }
    @media (max-width: ${MOBILE_MAX_WIDTH}) {
        margin: 5px 0 0 0;
    }
`;

const ClaimVoucherBox = styled(VoucherBox)<{ disabled: boolean }>`
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

const TextCenter = styled.div`
    text-align: center;
`;

const TextWrapper = styled.div`
    padding: 25px 5px 0 5px;
    @media (max-width: ${MOBILE_MAX_WIDTH}) {
        max-width: ${MOBILE_VOUCHER_MAX_WIDTH};
    }
`;

const InfoText = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
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

const Title = styled(Text)`
    font-weight: 700;
    font-size: 20px;
    line-height: 23px;
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

const TimeLabel = styled(Text)`
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

const Link = styled.a`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    color: #3fd1ff;
`;

const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: space-evenly;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 4px;
    height: 200px;
    flex-direction: column;
    padding: 0 10px;
    margin: 20px 0 10px 0;
`;

const EmptyTitle = styled.span`
    font-family: 'Nunito' !important;
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 130%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #64d9fe;
`;

export default Voucher;

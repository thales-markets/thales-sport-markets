import particle from 'assets/images/particle.png';
import VerifySvg from 'assets/images/svgs/verify.svg?react';
import Button from 'components/Button';
import ClaimFreeBetButton from 'components/ClaimFreeBetButton';
import DepositFromWallet from 'components/DepositFromWallet';
import Modal from 'components/Modal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import Tooltip from 'components/Tooltip';
import UniversalModal from 'components/UniversalModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES } from 'constants/currency';
import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Network } from 'enums/network';
import { ScreenSizeBreakpoint } from 'enums/ui';
import QRCodeModal from 'pages/AARelatedPages/Deposit/components/QRCodeModal';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    getIsBiconomy,
    getIsSmartAccountDisabled,
    setIsBiconomy,
    setIsSmartAccountDisabled,
} from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow, FlexDivStart } from 'styles/common';
import { truncateAddress } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollateralAddress, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { isSmallDevice } from 'utils/device';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getOnRamperUrl } from 'utils/particleWallet/utils';
import { navigateTo } from 'utils/routes';
import { verifyOvertimeAccount } from 'utils/smartAccount/biconomy/biconomy';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import useUniversalAccount from 'utils/smartAccount/hooks/useUniversalAccount';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { useAccount, useChainId, useClient } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const [showLetsBetButton, setShowLetsBetButton] = useState(false);
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isSmartAccountDisabled = useSelector(getIsSmartAccountDisabled);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { universalAddress } = useUniversalAccount(); // added this hook here so we reduce the amount for loading universal data when users opens universal deposit
    console.log(universalAddress);

    const client = useClient();
    const { address, isConnected } = useAccount();

    const theme = useTheme();
    const networkId = useChainId();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [showDepositFromWallet, setShowDepositFromWallet] = useState<boolean>(false);
    const [showUniversalModal, setShowUniversalModal] = useState<boolean>(false);
    const [showVerificationButton, setShowVerificationButton] = useState<boolean>(false);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        address as string,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total;
        } catch (e) {
            return 0;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.info(`${t('deposit.copied')}: ${truncateAddress(walletAddress, 6, 4)}`);
        } catch (e) {
            toast.error('Error');
        }
    };

    const apiKey = import.meta.env.VITE_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, walletAddress, networkId);
    }, [walletAddress, networkId, apiKey]);

    useEffect(() => {
        if (isBiconomy && smartAddress) {
            const verifiedOvertimeAccounts = new Set(
                JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.VERIFIED_OVERTIME_ACCOUNTS) || '[]')
            );
            const invalidOvertimeAccounts = new Set(
                JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVALID_OVERTIME_ACCOUNTS) || '[]')
            );
            if (invalidOvertimeAccounts.has(smartAddress)) {
                dispatch(setIsSmartAccountDisabled(true));
                dispatch(setIsBiconomy(false));
                localStorage.setItem(LOCAL_STORAGE_KEYS.USE_BICONOMY, 'false');
                setShowVerificationButton(false);
                return;
            }
            if (verifiedOvertimeAccounts.has(smartAddress)) {
                dispatch(setIsSmartAccountDisabled(false));
                setShowVerificationButton(false);
                return;
            }

            smartAccountConnector.biconomyAccount?.isAccountDeployed().then((isDeployed) => {
                if (isDeployed) {
                    setShowVerificationButton(false);
                    verifiedOvertimeAccounts.add(smartAddress);
                    localStorage.setItem(
                        LOCAL_STORAGE_KEYS.VERIFIED_OVERTIME_ACCOUNTS,
                        JSON.stringify(Array.from(verifiedOvertimeAccounts))
                    );
                } else {
                    setShowVerificationButton(true);
                }
            });
        }
    }, [isBiconomy, dispatch, smartAddress, isSmartAccountDisabled]);

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 100,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            mobileStyle={{
                container: {
                    borderRadius: 0,
                    minHeight: '100vh',
                    padding: '25px 10px 35px 10px',
                    overflow: 'scroll',
                },
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Wrapper>
                {showVerificationButton && (
                    <FlexDivStart>
                        <VerifyButton
                            onClick={async () => {
                                const id = toast.loading(t('get-started.fund-account.verifying-account'));
                                const isValidConfig = await verifyOvertimeAccount();
                                if (isValidConfig.success) {
                                    const verifiedOvertimeAccounts = new Set(
                                        JSON.parse(
                                            localStorage.getItem(LOCAL_STORAGE_KEYS.VERIFIED_OVERTIME_ACCOUNTS) || '[]'
                                        )
                                    );
                                    verifiedOvertimeAccounts.add(smartAddress);
                                    localStorage.setItem(
                                        LOCAL_STORAGE_KEYS.VERIFIED_OVERTIME_ACCOUNTS,
                                        JSON.stringify(Array.from(verifiedOvertimeAccounts))
                                    );
                                    setShowVerificationButton(false);
                                    toast.update(
                                        id,
                                        getSuccessToastOptions(t('get-started.fund-account.verifying-account-success'))
                                    );
                                } else {
                                    if (isValidConfig.rejected) {
                                        toast.update(id, getErrorToastOptions(t('common.errors.user-rejected-tx')));
                                    } else {
                                        const invalidOvertimeAccounts = new Set(
                                            JSON.parse(
                                                localStorage.getItem(LOCAL_STORAGE_KEYS.INVALID_OVERTIME_ACCOUNTS) ||
                                                    '[]'
                                            )
                                        );
                                        invalidOvertimeAccounts.add(smartAddress);
                                        dispatch(setIsSmartAccountDisabled(true));
                                        dispatch(setIsBiconomy(false));
                                        localStorage.setItem(LOCAL_STORAGE_KEYS.USE_BICONOMY, 'false');
                                        localStorage.setItem(
                                            LOCAL_STORAGE_KEYS.INVALID_OVERTIME_ACCOUNTS,
                                            JSON.stringify(Array.from(invalidOvertimeAccounts))
                                        );
                                        toast.update(
                                            id,
                                            getErrorToastOptions(t('get-started.fund-account.verifying-account-error'))
                                        );
                                        onClose();
                                    }
                                }
                            }}
                        >
                            <VerifySvg />
                            {t('get-started.fund-account.verify-account')}
                            <Arrow className="icon icon--arrow-down" />
                        </VerifyButton>
                    </FlexDivStart>
                )}

                <NetworkWrapper>
                    <NetworkHeader>{t('get-started.fund-account.current-network')}</NetworkHeader>
                    <NetworkSwitcherWrapper>
                        <NetworkSwitcher />
                    </NetworkSwitcherWrapper>
                </NetworkWrapper>
                <FlexDivRow>
                    <Title>
                        <Trans
                            i18nKey="get-started.fund-account.title"
                            components={{
                                icon: <OvertimeIcon className="icon icon--overtime" />,
                            }}
                        />
                    </Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>{' '}
                </FlexDivRow>
                <SubTitle>
                    {t('get-started.fund-account.subtitle')}
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-1')}
                    ></Tooltip>
                </SubTitle>

                <CollateralsWrapper gap={14}>
                    {getCollaterals(networkId).map((token, key) => {
                        return (
                            <Tooltip
                                overlay={
                                    <div>
                                        {token}:
                                        <TooltipText>
                                            {`${getCollateralAddress(networkId, getCollateralIndex(networkId, token))}`}
                                        </TooltipText>
                                    </div>
                                }
                                key={key}
                            >
                                <CollateralWrapper>
                                    <Asset className={COLLATERAL_ICONS_CLASS_NAMES[token]} />
                                    <CollateralText>{token}</CollateralText>
                                </CollateralWrapper>
                            </Tooltip>
                        );
                    })}
                </CollateralsWrapper>

                <WalletContainer>
                    <FieldHeader>
                        {t('get-started.fund-account.address')}
                        <FieldDesc>
                            <Trans
                                i18nKey="get-started.fund-account.tooltip-2"
                                components={{
                                    span: <span />,
                                }}
                                values={{
                                    network: getNetworkNameByNetworkId(networkId),
                                }}
                            />
                        </FieldDesc>
                    </FieldHeader>

                    <AddressContainer>
                        <Field onClick={handleCopy}>
                            {walletAddress} <QRIcon className="icon icon--copy" />
                        </Field>
                        <ButtonsContainer>
                            <BlueField
                                onClick={() => {
                                    setShowQRModal(!showQRModal);
                                }}
                            >
                                <QRIcon className="icon icon--qr-code" />
                            </BlueField>
                        </ButtonsContainer>
                    </AddressContainer>
                </WalletContainer>
                <ClaimFreeBetButton styles={{ marginTop: '14px' }} onClaim={() => setShowLetsBetButton(true)} />
                {showLetsBetButton && (
                    <Container>
                        <Button
                            onClick={() => {
                                setShowLetsBetButton(false);
                                navigateTo(ROUTES.Markets.Home);
                            }}
                            width="100%"
                            height="44px"
                            fontSize="16px"
                            backgroundColor={theme.background.quaternary}
                            borderRadius="8px"
                            borderColor={theme.borderColor.quaternary}
                            textColor={theme.textColor.tertiary}
                        >
                            {t('free-bet.claim-modal.lets-bet-button')}
                        </Button>
                    </Container>
                )}

                <Container>
                    {networkId === Network.OptimismMainnet && !isSmartAccountDisabled && !showVerificationButton && (
                        <Tooltip
                            customIconStyling={{ color: theme.textColor.secondary }}
                            overlay={t('get-started.fund-account.tooltip-universal')}
                            open={!isSmallDevice}
                        >
                            <ButtonLocal
                                onClick={() => {
                                    setShowUniversalModal(true);
                                }}
                            >
                                <ButtonText>{t('get-started.fund-account.universal-deposit')}</ButtonText>
                                <ParticleLogo src={particle} />
                                <BetaTag>Beta</BetaTag>
                            </ButtonLocal>
                        </Tooltip>
                    )}
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-5')}
                        open={!isSmallDevice}
                    >
                        <ButtonLocal
                            onClick={() => {
                                window.open(onramperUrl, '_blank');
                            }}
                        >
                            <ButtonText>{t('get-started.fund-account.buy-crypto')}</ButtonText>
                            <Icon className="icon icon--card" />
                        </ButtonLocal>
                    </Tooltip>
                    {!isSmartAccountDisabled && !showVerificationButton && (
                        <Tooltip
                            customIconStyling={{ color: theme.textColor.secondary }}
                            overlay={t('get-started.fund-account.tooltip-4')}
                            open={!isSmallDevice}
                        >
                            <ButtonLocal
                                disabled={totalBalanceValue === 0}
                                onClick={() => {
                                    totalBalanceValue > 0 && setShowDepositFromWallet(!showDepositFromWallet);
                                }}
                            >
                                <ButtonText>{t('get-started.fund-account.from-wallet')}</ButtonText>
                                <Icon className="icon icon--wallet-connected" />
                            </ButtonLocal>
                        </Tooltip>
                    )}

                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-3')}
                        open={!isSmallDevice}
                    >
                        <ButtonLocal disabled>
                            <ButtonText>{t('get-started.fund-account.from-exchange')}</ButtonText>
                            <Icon className="icon icon--affiliate" />
                        </ButtonLocal>
                    </Tooltip>
                </Container>
            </Wrapper>
            {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} walletAddress={walletAddress} />}
            {showDepositFromWallet && <DepositFromWallet onClose={() => setShowDepositFromWallet(false)} />}
            {showUniversalModal && (
                <UniversalModal
                    onClose={() => {
                        setShowUniversalModal(false);
                    }}
                />
            )}
        </Modal>
    );
};

const Wrapper = styled.div`
    max-width: 520px;
`;

const OvertimeIcon = styled.i`
    font-size: 128px;
    font-weight: 400;
    line-height: 28px;
    @media (max-width: 512px) {
        font-size: 100px;
        line-height: 20px;
    }

    @media (max-width: 412px) {
        font-size: 96px;
        line-height: 18px;
    }
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
    text-transform: uppercase;
    white-space: pre;

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 20px;
        white-space: pre;
        gap: 2px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 16px;
        line-height: 16px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        flex-wrap: wrap;
    }
`;

const SubTitle = styled.h1`
    position: relative;
    font-weight: 600;
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
`;

const FieldHeader = styled.p`
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const NetworkHeader = styled(FieldHeader)`
    color: ${(props) => props.theme.textColor.secondary};
`;

const ButtonText = styled.p`
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    white-space: pre;

    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        font-size: 14px;
    }
`;

const FieldDesc = styled.p`
    font-size: 14px;
    font-weight: 600;
    margin-top: 10px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: break-spaces;
    span {
        color: ${(props) => props.theme.warning.textColor.primary};
    }
`;

const TooltipText = styled.span`
    white-space: pre;
`;

const ButtonsContainer = styled.div`
    display: flex;
    width: 60px;
    align-items: center;
    justify-content: center;
    gap: 10px;
    @media (max-width: 850px) {
        width: 100%;
    }
`;

const AddressContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 10px;

    @media (max-width: 850px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
`;

const Container = styled(FlexDivCentered)`
    margin-top: 14px;
    gap: 14px;
    flex-direction: column;
    align-items: flex-start;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    gap: 14px;
`;

const Field = styled.div`
    height: 44px;
    background: ${(props) => props.theme.textColor.primary};
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    width: 100%;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 575px) {
        font-size: 12px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        font-size: 10px;
        padding: 6px;
    }
`;

const BlueField = styled(Field)`
    position: relative;
    background: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.senary};
    flex: 1;
    cursor: pointer;
    justify-content: center;
`;

const QRIcon = styled.i`
    font-size: 30px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.senary};
    cursor: pointer;
    @media (max-width: 575px) {
        font-size: 24px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        font-size: 20px;
    }
`;

const Icon = styled.i`
    font-weight: 400;
    font-size: 20px;
`;

const ParticleLogo = styled.img`
    height: 24px;
`;

const CollateralText = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.42px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 10px;
    }
`;

const CollateralsWrapper = styled(FlexDivCentered)`
    flex-wrap: wrap;
    margin-bottom: 60px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 10px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-bottom: 30px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXXS}px) {
        max-width: 190px;
        margin: auto;
        gap: 10px 20px;
        margin-bottom: 30px;
    }
`;

const CollateralWrapper = styled(FlexDivColumnCentered)`
    align-items: center;
    flex: 0;
    gap: 8px;
`;

const NetworkWrapper = styled(FlexDivCentered)`
    margin-top: 10px;
    margin-bottom: 16px;
    gap: 2px;
`;

const NetworkSwitcherWrapper = styled.div`
    position: relative;
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

const ButtonLocal = styled.button<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 8px;
    width: 100%;

    height: 42px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    gap: 8px;
    background: transparent;

    font-size: 14px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;

    white-space: pre;
    padding: 3px 24px;
    @media (max-width: 575px) {
        font-size: 12px;
        padding: 3px 12px;
    }

    i {
        color: ${(props) => props.theme.textColor.quaternary};
    }

    ${(props) =>
        !props.disabled
            ? `
        &:hover {
            background-color: ${props.theme.connectWalletModal.hover};
            color: ${props.theme.button.textColor.primary};
            i {
                color: ${props.theme.button.textColor.primary};
            }

            span {
             color: ${props.theme.button.textColor.primary};
            }
    }
    `
            : ''}

    opacity: ${(props) => (props.disabled ? '0.5' : '1')};
`;

const BetaTag = styled.span`
    position: absolute;
    right: 10px;
    top: 12px;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: capitalize;
    font-size: 14px;
`;

const Asset = styled.i<{ fontSize?: string }>`
    font-size: 40px;
    line-height: 40px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 24px;
        line-height: 24px;
    }
`;

const VerifyButton = styled.button`
    position: relative;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #000000;
    padding: 14px 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
    width: 100%;
    margin-top: 20px;

    letter-spacing: 0.025em;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    &:hover {
        box-shadow: 0 6px 20px rgba(251, 191, 36, 0.35);
    }

    svg {
        width: 24px;
        height: 24px;
        margin-right: 10px;
    }
`;

const Arrow = styled.i.attrs({ className: 'icon icon--arrow-down' })`
    position: absolute;
    right: 20px;
    top: 18px;
    transform: rotate(270deg);
    font-size: 16px;
    text-transform: lowercase;
`;

export default FundModal;

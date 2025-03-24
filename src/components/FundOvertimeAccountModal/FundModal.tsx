import Button from 'components/Button';
import DepositFromWallet from 'components/DepositFromWallet/DepositFromWallet';
import Modal from 'components/Modal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import QRCodeModal from 'pages/AARelatedPages/Deposit/components/QRCodeModal';
import useGetFreeBetQuery from 'queries/freeBets/useGetFreeBetQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Colors, FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { truncateAddress } from 'thales-utils';
import { Rates } from 'types/collateral';
import { FreeBet } from 'types/freeBet';
import { RootState } from 'types/redux';
import { getCollateralAddress, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { claimFreeBet } from 'utils/freeBet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getOnRamperUrl } from 'utils/particleWallet/utils';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const [freeBet, setFreeBet] = useLocalStorage<FreeBet | undefined>(LOCAL_STORAGE_KEYS.FREE_BET_ID, undefined);
    const history = useHistory();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { t } = useTranslation();

    const client = useClient();
    const { address, isConnected } = useAccount();

    const theme = useTheme();
    const networkId = useChainId();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [showDepositFromWallet, setShowDepositFromWallet] = useState<boolean>(false);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        address as string,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const freeBetQuery = useGetFreeBetQuery(freeBet?.id || '', networkId, { enabled: !!freeBet?.id });

    const freeBetFromServer = useMemo(
        () =>
            freeBetQuery.isSuccess && freeBetQuery.data && freeBet?.id
                ? { ...freeBetQuery.data, id: freeBet?.id }
                : null,
        [freeBetQuery.data, freeBetQuery.isSuccess, freeBet?.id]
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
        const id = toast.loading(t('deposit.copying-address'));
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('deposit.copied') + ': ' + truncateAddress(walletAddress, 6, 4)));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    const apiKey = import.meta.env.VITE_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, walletAddress, networkId);
    }, [walletAddress, networkId, apiKey]);

    const onClaimFreeBet = useCallback(() => claimFreeBet(walletAddress, freeBet?.id, networkId, setFreeBet, history), [
        walletAddress,
        freeBet,
        setFreeBet,
        history,
        networkId,
    ]);

    const claimFreeBetButtonVisible =
        !!freeBetFromServer &&
        !freeBetFromServer?.claimSuccess &&
        (!freeBetFromServer.claimAddress ||
            freeBetFromServer.claimAddress.toLowerCase() === walletAddress.toLowerCase());

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 1000,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Wrapper>
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

                <NetworkWrapper>
                    <FieldHeader>{t('get-started.fund-account.current-network')}</FieldHeader>
                    <NetworkSwitcherWrapper>
                        <NetworkSwitcher />
                    </NetworkSwitcherWrapper>
                </NetworkWrapper>

                <WalletContainer>
                    <FieldHeader>
                        {t('get-started.fund-account.address')}
                        <FieldDesc>
                            {t('get-started.fund-account.tooltip-2', {
                                network: getNetworkNameByNetworkId(networkId),
                            })}
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
                                <QRIcon className="icon icon--qr-code" />{' '}
                                <FieldText>{t('get-started.fund-account.qr')}</FieldText>
                            </BlueField>
                        </ButtonsContainer>
                    </AddressContainer>
                </WalletContainer>
                {claimFreeBetButtonVisible && (
                    <Container>
                        <ClaimBetButton
                            onClick={onClaimFreeBet}
                            borderColor="none"
                            height="42px"
                            lineHeight="16px"
                            padding="0"
                            backgroundColor={Colors.YELLOW}
                            className="pulse"
                        >
                            {t('get-started.fund-account.claim-free-bet')}
                            <HandsIcon className="icon icon--hands-coins" />
                        </ClaimBetButton>
                    </Container>
                )}

                <Container>
                    <ButtonLocal
                        onClick={() => {
                            window.open(onramperUrl, '_blank');
                        }}
                    >
                        <ButtonText>{t('get-started.fund-account.buy-crypto')}</ButtonText>
                        <Icon className="icon icon--card" />
                    </ButtonLocal>
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-4')}
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
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-3')}
                    >
                        <ButtonLocal disabled>
                            <ButtonText>{t('get-started.fund-account.from-exchange')}</ButtonText>
                            <Icon className="icon icon--affiliate" />
                        </ButtonLocal>
                    </Tooltip>
                </Container>
            </Wrapper>
            {showQRModal && (
                <QRCodeModal title="" onClose={() => setShowQRModal(false)} walletAddress={walletAddress} />
            )}
            {showDepositFromWallet && <DepositFromWallet onClose={() => setShowDepositFromWallet(false)} />}
        </Modal>
    );
};

const Wrapper = styled.div`
    max-width: 480px;
`;

const OvertimeIcon = styled.i`
    font-size: 124px;
    font-weight: 400;
    line-height: 28px;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
    text-transform: uppercase;
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

const ButtonText = styled.p`
    font-size: 16px;

    font-weight: 600;
    line-height: 16px;
    white-space: pre;
`;

const FieldDesc = styled.p`
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: break-spaces;
`;

const TooltipText = styled.span`
    white-space: pre;
`;

const ButtonsContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 20px;
`;

const AddressContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;

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
    @media (max-width: 575px) {
        font-size: 12px;
    }
    font-size: 12px;
    width: 100%;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BlueField = styled(Field)`
    position: relative;
    background: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.senary};
    flex: 1;

    cursor: pointer;
`;

const FieldText = styled.p`
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.textColor.senary};
    white-space: pre;
`;

const QRIcon = styled.i`
    font-size: 24px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.senary};
    cursor: pointer;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const Icon = styled.i`
    font-weight: 400;
    font-size: 20px;
`;

const CollateralText = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.42px;
`;

const CollateralsWrapper = styled(FlexDivCentered)`
    flex-wrap: wrap;
`;

const CollateralWrapper = styled(FlexDivColumnCentered)`
    align-items: center;
    flex: 0;
    gap: 8px;
`;

const NetworkWrapper = styled(FlexDivCentered)`
    margin-top: 30px;
    margin-bottom: 16px;
    gap: 2px;
`;

const NetworkSwitcherWrapper = styled.div`
    position: relative;
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: white;
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

const HandsIcon = styled.i`
    font-weight: 500;
    margin-left: 5px;
    font-size: 22px;
    color: ${(props) => props.theme.textColor.tertiary};
`;

const ClaimBetButton = styled(Button)`
    width: 100%;
    &.pulse {
        animation: pulsing 1.5s ease-in;
        animation-iteration-count: infinite;
        @keyframes pulsing {
            0% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.6);
            }
            50% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.4);
            }
            100% {
                box-shadow: 0 0 0 20px rgba(237, 185, 41, 0);
            }
        }
    }
`;

const ButtonLocal = styled(FlexDivCentered)<{ disabled?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 42px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    gap: 8px;

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
    }
    `
            : ''}

    opacity: ${(props) => (props.disabled ? '0.5' : '1')};
`;

const Asset = styled.i<{ fontSize?: string }>`
    font-size: 40px;
    line-height: 40px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default FundModal;

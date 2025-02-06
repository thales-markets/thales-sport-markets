import DepositFromWallet from 'components/DepositFromWallet/DepositFromWallet';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { COLLATERAL_ICONS } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import QRCodeModal from 'pages/AARelatedPages/Deposit/components/QRCodeModal';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { truncateAddress } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/collaterals';
import { claimFreeBet } from 'utils/freeBet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { getOnRamperUrl } from 'utils/particleWallet/utils';
import { useAccount, useChainId, useClient } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const queryParams: { freeBet?: string } = queryString.parse(location.search);
    const [freeBet, setFreeBet] = useLocalStorage<string | undefined>(
        LOCAL_STORAGE_KEYS.FREE_BET_ID,
        queryParams.freeBet
    );
    const history = useHistory();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { t } = useTranslation();

    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';
    const theme = useTheme();
    const networkId = useChainId();

    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [showDepositFromWallet, setShowDepositFromWallet] = useState<boolean>(false);

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
        const id = toast.loading(t('deposit.copying-address'));
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('deposit.copied')));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    const apiKey = import.meta.env.VITE_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, walletAddress, networkId);
    }, [walletAddress, networkId, apiKey]);

    const onClaimFreeBet = useCallback(() => claimFreeBet(walletAddress, freeBet, networkId, setFreeBet, history), [
        walletAddress,
        freeBet,
        setFreeBet,
        history,
        networkId,
    ]);

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
                        if (COLLATERAL_ICONS[token]) {
                            const ReactElem = COLLATERAL_ICONS[token];
                            return (
                                <CollateralWrapper key={key}>
                                    <ReactElem />
                                    <CollateralText>{token}</CollateralText>
                                </CollateralWrapper>
                            );
                        }
                    })}
                </CollateralsWrapper>

                <NetworkWrapper>
                    <FieldHeader>Current Network: </FieldHeader>
                    <YellowText>{getNetworkNameByNetworkId(networkId, true)}</YellowText>
                </NetworkWrapper>

                <WalletContainer>
                    <FieldHeader>
                        {t('get-started.fund-account.address')}
                        <Tooltip
                            customIconStyling={{ color: theme.textColor.secondary }}
                            overlay={t('get-started.fund-account.tooltip-2', {
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                        ></Tooltip>
                    </FieldHeader>
                    <AddressContainer>
                        <Field>{isMobile ? truncateAddress(walletAddress, 8, 5) : walletAddress}</Field>
                        <ButtonsContainer>
                            <BlueField onClick={handleCopy}>
                                <QRIcon className="icon icon--copy" />
                                <FieldText>{t('get-started.fund-account.copy')}</FieldText>
                            </BlueField>
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

                <Container>
                    <Box
                        onClick={() => {
                            window.open(onramperUrl, '_blank');
                        }}
                    >
                        <FieldHeader>{t('get-started.fund-account.buy-crypto')}</FieldHeader>
                        <Icon className="icon icon--card" />
                    </Box>
                    {!!freeBet && (
                        <Box onClick={onClaimFreeBet}>
                            <FieldHeader>{t('get-started.fund-account.claim-free-bet')}</FieldHeader>
                            <Icon className="currency-icon currency-icon--over" />
                        </Box>
                    )}
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-4')}
                    >
                        <Box
                            disabled={totalBalanceValue === 0}
                            onClick={() => {
                                totalBalanceValue > 0 && setShowDepositFromWallet(!showDepositFromWallet);
                            }}
                        >
                            <FieldHeader>{t('get-started.fund-account.from-wallet')}</FieldHeader>
                            <Icon className="icon icon--wallet-connected" />
                        </Box>
                    </Tooltip>
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-3')}
                    >
                        <Box disabled>
                            <FieldHeader>{t('get-started.fund-account.from-exchange')}</FieldHeader>
                            <Icon className="icon icon--affiliate" />
                        </Box>
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

const Wrapper = styled.div``;

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
    gap: 16px;
    @media (max-width: 850px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    gap: 14px;
`;

const Box = styled(FlexDivCentered)<{ disabled?: boolean }>`
    border: 1px solid ${(props) => props.theme.textColor.secondary};
    border-radius: 8px;
    padding: 14px;
    gap: 14px;
    justify-content: space-between;
    min-width: 200px;
    height: 60px;
    width: 100%;
    cursor: pointer;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const Field = styled.div`
    height: 44px;
    background: ${(props) => props.theme.textColor.primary};
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BlueField = styled(Field)`
    position: relative;
    background: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.senary};
    flex: 1;
    font-weight: 600;
    cursor: pointer;
`;

const FieldText = styled.p`
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.textColor.senary};
`;

const QRIcon = styled.i`
    font-size: 24px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.senary};
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const Icon = styled.i`
    font-weight: 400;
    font-size: 20px;
    color: ${(props) => props.theme.textColor.quaternary};
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

const YellowText = styled(FieldText)`
    color: ${(props) => props.theme.button.background.quinary};
`;

const NetworkWrapper = styled(FlexDivCentered)`
    margin-top: 30px;
    margin-bottom: 16px;
    gap: 2px;
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: white;
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export default FundModal;

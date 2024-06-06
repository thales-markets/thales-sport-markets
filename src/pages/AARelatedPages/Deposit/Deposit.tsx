import CollateralSelector from 'components/CollateralSelector';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { COLLATERALS } from 'constants/currency';
import ROUTES from 'constants/routes';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivStart } from 'styles/common';
import { getOnRamperUrl } from 'utils/biconomy';
import { getCollaterals } from 'utils/collaterals';
import { getNetworkNameByNetworkId } from 'utils/network';
import { navigateTo } from 'utils/routes';
import useQueryParam, { getQueryStringVal } from 'utils/useQueryParams';
import {
    BalanceSection,
    CollateralContainer,
    DescriptionLabel,
    FormContainer,
    InputContainer,
    InputLabel,
    PrimaryHeading,
    WarningContainer,
    WarningIcon,
    WarningLabel,
    Wrapper,
} from '../styled-components';
import AllSetModal from './components/AllSetModal';
import BalanceDetails from './components/BalanceDetails';
import QRCodeModal from './components/QRCodeModal';

const Deposit: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [totalValue, setTotalValue] = useState<number | undefined>(undefined);
    const [showSuccessfulDepositModal, setShowSuccessfulDepositModal] = useState<boolean>(false);
    const [lowBalanceAlert, setLowBalanceAlert] = useState(false);

    const selectedTokenFromUrl = getQueryStringVal('coin-index');

    const [, setSelectedTokenFromQuery] = useQueryParam(
        'coin-index',
        selectedTokenFromUrl ? selectedTokenFromUrl : '0'
    );

    useEffect(() => {
        if (!isConnectedViaParticle) navigateTo(ROUTES.Markets.Home);
    }, [isConnectedViaParticle]);

    useEffect(() => {
        setSelectedToken(Number(selectedTokenFromUrl));
    }, [selectedTokenFromUrl]);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
        refetchInterval: 5000,
    });

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                return total;
            }
            return undefined;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    useEffect(() => {
        if (totalValue === undefined) {
            if (totalBalanceValue == 0) {
                setTotalValue(0);
                return;
            }
        }

        if (totalValue == 0 && totalBalanceValue && totalBalanceValue > 0) {
            setTotalValue(totalBalanceValue);
            setShowSuccessfulDepositModal(true);
        }
    }, [totalBalanceValue, totalValue]);

    const ethBalanceValue = useMemo(() => {
        let total = undefined;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                total = multipleCollateralBalances.data['ETH'] * (exchangeRates['ETH'] ? exchangeRates['ETH'] : 1);
            }

            return total;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data]);

    useEffect(() => {
        if (isConnectedViaParticle && ethBalanceValue !== undefined && Number(ethBalanceValue) < 2) {
            setLowBalanceAlert(true);
        } else {
            setLowBalanceAlert(false);
        }
    }, [ethBalanceValue, isConnectedViaParticle]);

    const inputRef = useRef<HTMLDivElement>(null);

    const walletAddressInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        const id = toast.loading(t('deposit.copying-address'));
        try {
            walletAddressInputRef.current?.value && navigator.clipboard.writeText(walletAddressInputRef.current?.value);
            toast.update(id, getInfoToastOptions(t('deposit.copied')));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    const handleChangeCollateral = (index: number) => {
        setSelectedToken(index);
        setSelectedTokenFromQuery(index.toString());
    };

    const apiKey = process.env.REACT_APP_ONRAMPER_KEY || '';

    const onramperUrl = useMemo(() => {
        return getOnRamperUrl(apiKey, walletAddress, networkId, selectedToken);
    }, [walletAddress, networkId, apiKey, selectedToken]);

    return (
        <>
            <Wrapper>
                <FormContainer>
                    <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>
                    <DescriptionLabel>{t('deposit.description')}</DescriptionLabel>
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <InputContainer ref={inputRef}>
                        <CollateralContainer ref={inputRef}>
                            <CollateralSelector
                                collateralArray={lowBalanceAlert ? ['ETH'] : COLLATERALS[networkId]}
                                selectedItem={selectedToken}
                                onChangeCollateral={(index) => handleChangeCollateral(index)}
                                disabled={false}
                                collateralBalances={[multipleCollateralBalances.data]}
                                exchangeRates={exchangeRates}
                                dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                hideCollateralNameOnInput={false}
                                hideBalance
                                isDetailedView
                                stretch
                                showCollateralImg
                                showNetworkName
                            />
                        </CollateralContainer>
                    </InputContainer>
                    {lowBalanceAlert && (
                        <FlexDivStart>
                            <WarningI className="icon icon--risks" />
                            <WarningLabel>{t('deposit.warning')}</WarningLabel>
                        </FlexDivStart>
                    )}
                    <DepositAddressFormContainer>
                        <InputLabel>
                            {t('deposit.address-input-label', {
                                token: getCollaterals(networkId)[selectedToken],
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                        </InputLabel>
                        <WalletAddressInputWrapper>
                            <InputContainer>
                                <WalletAddressInput
                                    type={'text'}
                                    value={walletAddress}
                                    readOnly
                                    ref={walletAddressInputRef}
                                />
                                <QRIcon
                                    onClick={() => {
                                        setShowQRModal(!showQRModal);
                                    }}
                                    className="icon icon--qr-code"
                                />
                            </InputContainer>
                            <CopyButton onClick={() => handleCopy()}>{'Copy'}</CopyButton>
                        </WalletAddressInputWrapper>
                        <WarningContainer>
                            <WarningIcon className={'icon icon--warning'} />
                            {t('deposit.send', {
                                token: getCollaterals(networkId)[selectedToken],
                                network: getNetworkNameByNetworkId(networkId, true),
                            })}
                        </WarningContainer>
                    </DepositAddressFormContainer>
                    <BuyWithText>{t('deposit.or-buy-with')}</BuyWithText>
                    <OnramperDiv
                        onClick={() => {
                            window.open(onramperUrl, '_blank');
                        }}
                    >
                        <OnramperIcons className={`icon-homepage icon--visa`} />
                        <OnramperIcons className={`icon-homepage icon--master`} />
                        <OnramperIcons className={`icon-homepage icon--applepay`} />
                        <OnramperIcons className={`icon-homepage icon--googlepay`} />
                        <ExternalIcon className={`icon-homepage icon--arrow-right`} />
                    </OnramperDiv>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                    <TutorialLinksContainer>
                        <SectionLabel>{t('deposit.tutorials.title')}</SectionLabel>
                        <Link href={'https://docs.overtimemarkets.xyz/deposit-guides/deposit-usdc-from-coinbase'}>
                            {t('deposit.tutorials.coinbase')}
                        </Link>
                        <Link
                            href={
                                'https://docs.overtimemarkets.xyz/deposit-guides/deposit-usdc-or-usdt-from-binance/deposit-from-binance-mobile-app'
                            }
                        >
                            {t('deposit.tutorials.binance-mobile')}
                        </Link>
                        <Link
                            href={
                                'https://docs.overtimemarkets.xyz/deposit-guides/deposit-usdc-or-usdt-from-binance/deposit-from-binance-website'
                            }
                        >
                            {t('deposit.tutorials.binance')}
                        </Link>
                    </TutorialLinksContainer>
                </BalanceSection>
            </Wrapper>
            {showQRModal && (
                <QRCodeModal
                    onClose={() => setShowQRModal(false)}
                    walletAddress={walletAddress}
                    title={t('deposit.qr-modal-title', {
                        token: getCollaterals(networkId)[selectedToken],
                        network: getNetworkNameByNetworkId(networkId, true),
                    })}
                />
            )}
            {showSuccessfulDepositModal && <AllSetModal onClose={() => setShowSuccessfulDepositModal(false)} />}
        </>
    );
};

const DepositAddressFormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
`;

const BuyWithText = styled.span`
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: capitalize;
    margin: auto;
    margin-top: 80px;
    margin-bottom: 60px;
    @media (max-width: 800px) {
        margin-top: 20px;
        margin-bottom: 0;
    }
`;

const OnramperIcons = styled.i`
    font-size: 100px;
    font-weight: 400;
    text-transform: none;
    @media (max-width: 800px) {
        font-size: 80px;
    }
`;

const WalletAddressInputWrapper = styled(FlexDiv)`
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    @media (max-width: 575px) {
        flex-direction: column;
    }
`;

const OnramperDiv = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.3s ease-out;
    :hover {
        transform: scale(1.2);
    }
`;

const WalletAddressInput = styled.input`
    font-size: 18px;
    font-weight: 400;
    cursor: pointer;
    height: 32px;
    width: 100%;
    padding: 5px;
    opacity: 0.8;
    border-radius: 5px;
    color: ${(props) => props.theme.input.textColor.secondary};
    background-color: ${(props) => props.theme.input.background.secondary};
    border: ${(props) => `1px ${props.theme.input.borderColor.tertiary} solid`};
    @media (max-width: 800px) {
        font-size: 14px;
    }
`;

const QRIcon = styled.i`
    font-size: 24px;
    position: absolute;
    cursor: pointer;
    right: 5px;
    top: 5px;
    color: ${(props) => props.theme.input.textColor.secondary};
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const CopyButton = styled(FlexDiv)`
    font-size: 18px;
    border-radius: 5px;
    font-weight: 700;
    padding: 7px 20px;
    height: auto;
    cursor: pointer;
    text-transform: uppercase;
    line-height: 18px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.quaternary};
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const SectionLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 13px;
`;

const TutorialLinksContainer = styled(FlexDiv)`
    flex-direction: column;
    border-radius: 5px;
    margin-bottom: 13px;
    padding: 19px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
`;

const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-weight: 700;
    line-height: 250%;
    text-decoration-line: underline;
`;

const ExternalIcon = styled.i`
    font-size: 50px;
    font-weight: 400;
`;

const WarningI = styled.i`
    font-size: 12px;
    margin-right: 2px;
    margin-top: 2px;
`;

export default Deposit;

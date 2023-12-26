import CollateralSelector from 'components/CollateralSelector';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { COLLATERALS_AA } from 'constants/currency';
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
import { FlexDiv } from 'styles/common';
import { getOnRamperUrl } from 'utils/biconomy';
import { getCollaterals } from 'utils/collaterals';
import { getNetworkNameByNetworkId } from 'utils/network';
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

    const selectedTokenFromUrl = getQueryStringVal('coin-index');

    const [, setSelectedTokenFromQuery] = useQueryParam(
        'coin-index',
        selectedTokenFromUrl ? selectedTokenFromUrl : '0'
    );

    useEffect(() => {
        if (selectedTokenFromUrl != selectedToken.toString()) {
            setSelectedToken(Number(selectedTokenFromUrl));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            if (!exchangeRates && !multipleCollateralBalances.data) return undefined;

            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId, isConnectedViaParticle).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, isConnectedViaParticle]);

    useEffect(() => {
        if (totalBalanceValue == 0) {
            setTotalValue(0);
            return;
        }
        if (totalValue == 0 && totalBalanceValue && totalBalanceValue > 0) {
            setTotalValue(totalBalanceValue);
            setShowSuccessfulDepositModal(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalBalanceValue]);

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
                                collateralArray={COLLATERALS_AA[networkId]}
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
                    <DepositAddressFormContainer>
                        <InputLabel>
                            {t('deposit.address-input-label', {
                                token: getCollaterals(networkId, true)[selectedToken],
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
                                    className="social-icon icon--qr-code"
                                />
                            </InputContainer>
                            <CopyButton onClick={() => handleCopy()}>{'Copy'}</CopyButton>
                        </WalletAddressInputWrapper>
                        <WarningContainer>
                            <WarningIcon className={'icon icon--warning'} />
                            {t('deposit.send', {
                                token: getCollaterals(networkId, true)[selectedToken],
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
                        <OnramperIcons className={`social-icon icon--visa`} />
                        <OnramperIcons className={`social-icon icon--master`} />
                        <OnramperIcons className={`social-icon icon--applepay`} />
                        <OnramperIcons className={`social-icon icon--googlepay`} />
                        <ExternalIcon className={`social-icon icon--arrow-external`} />
                    </OnramperDiv>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                    <TutorialLinksContainer>
                        <SectionLabel>{'Tutorials'}</SectionLabel>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
                        <Link href={'#'}>{'Coinbase'}</Link>
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
`;

const OnramperIcons = styled.i`
    font-size: 100px;
    @media (max-width: 800px) {
        font-size: 80px;
    }
`;

const WalletAddressInputWrapper = styled(FlexDiv)`
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
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
    width: 100%;
    padding: 5px;
    opacity: 0.8;
    border-radius: 5px;
    color: ${(props) => props.theme.input.textColor.secondary};
    background-color: ${(props) => props.theme.input.background.secondary};
    border: ${(props) => `1px ${props.theme.input.borderColor.tertiary} solid`};
`;

const QRIcon = styled.i`
    font-size: 24px;
    position: absolute;
    cursor: pointer;
    right: 5px;
    top: 5px;
    color: ${(props) => props.theme.input.textColor.secondary};
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
    font-family: Roboto;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 250%;
    text-decoration-line: underline;
    text-transform: capitalize;
`;

const ExternalIcon = styled.i`
    font-size: 26px;
    font-weight: 400;
`;

export default Deposit;

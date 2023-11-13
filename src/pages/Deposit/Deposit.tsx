import NumericInput from 'components/fields/NumericInput';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';
import CollateralSelector from 'components/CollateralSelector';
import { getCollaterals } from 'utils/collaterals';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { getNetworkNameByNetworkId } from 'utils/network';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import QRCodeModal from './components/QRCodeModal';

const Deposit: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [showQRModal, setShowQRModal] = useState<boolean>(false);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const paymentTokenBalance: number = useMemo(() => {
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollaterals(networkId, true)[selectedToken]];
        }
        return 0;
    }, [multipleCollateralBalances.data, multipleCollateralBalances.isSuccess, networkId, selectedToken]);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

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

    return (
        <>
            {isMobile && <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>}
            <Wrapper>
                <FormContainer>
                    {!isMobile && <PrimaryHeading>{t('deposit.deposit-crypto')}</PrimaryHeading>}
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <WalletAddressInputContainer ref={inputRef}>
                        <NumericInput
                            value={getCollaterals(networkId, true)[selectedToken]}
                            onChange={(e) => {
                                console.log(e);
                            }}
                            inputFontSize="18px"
                            inputFontWeight="700"
                            inputPadding="5px 10px"
                            borderColor={theme.input.borderColor.tertiary}
                            disabled={false}
                            readonly={true}
                            inputType="text"
                            currencyComponent={
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId, true)}
                                    selectedItem={selectedToken}
                                    onChangeCollateral={(index) => setSelectedToken(index)}
                                    disabled={false}
                                    isDetailedView
                                    collateralBalances={[multipleCollateralBalances.data]}
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={inputRef.current?.getBoundingClientRect().width + 'px'}
                                    hideCollateralNameOnInput={true}
                                    hideBalance={true}
                                />
                            }
                            balance={formatCurrencyWithKey(
                                getCollaterals(networkId, true)[selectedToken],
                                paymentTokenBalance
                            )}
                            enableCurrencyComponentOnly={true}
                        />
                    </WalletAddressInputContainer>
                    <DepositAddressFormContainer>
                        <InputLabel>
                            {t('deposit.address-input-label', {
                                token: getCollaterals(networkId, true)[selectedToken],
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                        </InputLabel>
                        <WalletAddressInputWrapper>
                            <WalletAddressInputContainer>
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
                            </WalletAddressInputContainer>
                            <CopyButton onClick={() => handleCopy()}>{'Copy'}</CopyButton>
                        </WalletAddressInputWrapper>
                        <WarningContainer>
                            <WarningIcon className={'icon icon--warning'} />
                            {t('deposit.send', {
                                token: getCollaterals(networkId, true)[selectedToken],
                                network: getNetworkNameByNetworkId(networkId),
                            })}
                        </WarningContainer>
                    </DepositAddressFormContainer>
                </FormContainer>
                <BalanceSection>
                    <BalanceWrapper>
                        <SectionLabel>{'Balance'}</SectionLabel>
                        <TotalBalance>{'$304.654'}</TotalBalance>
                        <TokenBalancesWrapper>
                            {getCollaterals(networkId, true).map((token, index) => {
                                return (
                                    <IndividualTokenBalanceWrapper key={`ind-token-${index}`}>
                                        <Token>
                                            <TokenIcon
                                                className={`currency-icon currency-icon--${token.toLowerCase()}`}
                                            />
                                            {token}
                                        </Token>
                                        <IndividualTokenBalance>
                                            {multipleCollateralBalances.data
                                                ? formatCurrency(multipleCollateralBalances.data[token])
                                                : 0}
                                        </IndividualTokenBalance>
                                    </IndividualTokenBalanceWrapper>
                                );
                            })}
                        </TokenBalancesWrapper>
                    </BalanceWrapper>
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
                        token: getCollaterals(networkId, true)[selectedToken],
                        network: getNetworkNameByNetworkId(networkId),
                    })}
                />
            )}
        </>
    );
};

const Wrapper = styled(FlexDiv)`
    align-items: flex-start;
    flex-direction: row;
    width: 100%;
    @media (max-width: 575px) {
        flex-wrap: wrap-reverse;
    }
`;

const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 60%;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const BalanceSection = styled(FlexDiv)`
    flex-direction: column;
    width: 40%;
    padding: 0 20px;
    @media (max-width: 575px) {
        padding: 0;
        width: 100%;
    }
`;

const PrimaryHeading = styled.h1`
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 20px;
    margin-bottom: 21px;
`;

const InputLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    margin-bottom: 5px;
`;

const DepositAddressFormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
`;

const WalletAddressInputWrapper = styled(FlexDiv)`
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

const WalletAddressInputContainer = styled(FlexDiv)`
    position: relative;
    margin-right: 10px;
    width: 100%;
`;

const WalletAddressInput = styled.input`
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    padding: 5px;
    opacity: 0.5;
    border-radius: 5px;
    color: ${(props) => props.theme.input.textColor.secondary};
    background-color: ${(props) => props.theme.input.background.secondary};
    border: ${(props) => `1px ${props.theme.input.borderColor.tertiary} solid`};
`;

const QRIcon = styled.i`
    font-size: 24px;
    position: absolute;
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

const WarningContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.connectWalletModal.warningBackground};
    color: ${(props) => props.theme.connectWalletModal.warningText};
    padding: 5px;
    align-items: center;
    font-weight: 400;
    text-transform: capitalize;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 18px;
    @media (max-width: 575px) {
        font-size: 12px;
    }
`;

const WarningIcon = styled.i`
    padding-right: 12px;
    padding-left: 5px;
`;

const BalanceWrapper = styled(FlexDiv)`
    flex-direction: column;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    border-radius: 5px;
    padding: 19px;
    margin-bottom: 20px;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
`;

const SectionLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 3px;
    margin-bottom: 13px;
`;

const TotalBalance = styled.span`
    font-size: 42px;
    font-weight: 700;
    width: 100%;
    border-bottom: 1px ${(props) => props.theme.borderColor.primary} solid;
    margin-bottom: 20px;
    padding-bottom: 20px;
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    min-width: 150px;
    margin-right: 40px;
    @media (max-width: 575px) {
        margin-right: 10px;
    }
`;

const Token = styled(FlexDiv)`
    font-weight: 700;
    align-items: center;
    font-size: 12px;
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

const IndividualTokenBalance = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-align: right;
`;

const TutorialLinksContainer = styled(FlexDiv)`
    flex-direction: column;
    border-radius: 5px;
    margin-bottom: 13px;
    padding: 19px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
`;

const Link = styled.a`
    width: fit-content;
    font-size: 12px;
    font-weight: 700;
    text-decoration: underline;
    text-transform: capitalize;
    padding-bottom: 15px;
    :visited {
        color: ${(props) => props.theme.textColor.primary};
    }
`;
export default Deposit;

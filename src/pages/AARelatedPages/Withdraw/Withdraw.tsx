import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import TextInput from 'components/fields/TextInput';
import ROUTES from 'constants/routes';
import { ethers } from 'ethers';
import { t } from 'i18next';
import BalanceDetails from 'pages/AARelatedPages/Deposit/components/BalanceDetails';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy, getIsConnectedViaParticle } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/collaterals';
import { getNetworkNameByNetworkId } from 'utils/network';
import { navigateTo } from 'utils/routes';
import useQueryParam, { getQueryStringVal } from 'utils/useQueryParams';
import { useAccount, useChainId, useClient } from 'wagmi';
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
import WithdrawalConfirmationModal from './components/WithdrawalConfirmationModal';

type FormValidation = {
    walletAddress: boolean;
    amount: boolean;
};

const Withdraw: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const [selectedToken, setSelectedToken] = useState<number>(0);
    const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [showWithdrawalConfirmationModal, setWithdrawalConfirmationModalVisibility] = useState<boolean>(false);
    const [validation, setValidation] = useState<FormValidation>({ walletAddress: false, amount: false });

    const selectedTokenFromUrl = getQueryStringVal('coin-index');

    const [, setSelectedTokenFromQuery] = useQueryParam(
        'coin-index',
        selectedTokenFromUrl ? selectedTokenFromUrl : '0'
    );

    useEffect(() => {
        setSelectedToken(Number(selectedTokenFromUrl));
    }, [selectedTokenFromUrl]);

    const inputRef = useRef<HTMLDivElement>(null);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isAppReady && isConnected,
        }
    );

    const paymentTokenBalance: number = useMemo(() => {
        if (multipleCollateralBalances.data && multipleCollateralBalances.isSuccess) {
            return multipleCollateralBalances.data[getCollaterals(networkId)[selectedToken]];
        }
        return 0;
    }, [multipleCollateralBalances.data, multipleCollateralBalances.isSuccess, networkId, selectedToken]);

    const exchangeRatesQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    useEffect(() => {
        let walletValidation = false;
        let amountValidation = false;

        if (withdrawalWalletAddress != '' && ethers.utils.isAddress(withdrawalWalletAddress)) {
            walletValidation = true;
        }

        if (amount > 0 && !(amount > paymentTokenBalance)) {
            amountValidation = true;
        }

        setValidation({ walletAddress: walletValidation, amount: amountValidation });
    }, [amount, paymentTokenBalance, withdrawalWalletAddress]);

    const handleChangeCollateral = (index: number) => {
        setSelectedToken(index);
        setSelectedTokenFromQuery(index.toString());
    };

    useEffect(() => {
        if (!isConnectedViaParticle) navigateTo(ROUTES.Markets.Home);
    }, [isConnectedViaParticle]);

    return (
        <>
            <Wrapper>
                <FormContainer>
                    <PrimaryHeading>{t('withdraw.heading-withdraw')}</PrimaryHeading>
                    <DescriptionLabel>{t('withdraw.description')}</DescriptionLabel>
                    <InputLabel>{t('deposit.select-token')}</InputLabel>
                    <CollateralContainer ref={inputRef}>
                        <CollateralSelector
                            collateralArray={getCollaterals(networkId)}
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
                        />
                    </CollateralContainer>
                    <InputLabel marginTop="20px">
                        {t('withdraw.address-input-label', {
                            token: getCollaterals(networkId)[selectedToken],
                            network: getNetworkNameByNetworkId(networkId),
                        })}
                    </InputLabel>
                    <InputContainer>
                        <TextInput
                            value={withdrawalWalletAddress}
                            onChange={(el: { target: { value: React.SetStateAction<string> } }) =>
                                setWithdrawalWalletAddress(el.target.value)
                            }
                            placeholder={t('withdraw.paste-address')}
                            showValidation={!validation.walletAddress && !!withdrawalWalletAddress}
                            validationMessage={t('withdraw.validation.wallet-address')}
                        />
                    </InputContainer>
                    <InputLabel marginTop="20px">{t('withdraw.amount')}</InputLabel>
                    <InputContainer>
                        <NumericInput
                            value={amount}
                            onChange={(el) => setAmount(Number(el.target.value))}
                            placeholder={t('withdraw.paste-address')}
                            onMaxButton={() => setAmount(paymentTokenBalance)}
                            currencyLabel={getCollaterals(networkId)[selectedToken]}
                            showValidation={!validation.amount && amount > 0}
                            validationMessage={t('withdraw.validation.amount')}
                            balance={formatCurrencyWithKey(
                                getCollaterals(networkId)[selectedToken],
                                paymentTokenBalance
                            )}
                        />
                    </InputContainer>
                    <WarningContainer>
                        <WarningIcon className={'icon icon--warning'} />
                        {t('withdraw.warning', {
                            token: getCollaterals(networkId)[selectedToken],
                            network: getNetworkNameByNetworkId(networkId, true),
                        })}
                    </WarningContainer>
                    <ButtonContainer>
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            disabled={!validation.amount || !validation.walletAddress}
                            textColor={theme.button.textColor.primary}
                            borderColor={theme.button.borderColor.secondary}
                            padding={'5px 60px'}
                            fontSize={'22px'}
                            onClick={() => setWithdrawalConfirmationModalVisibility(true)}
                        >
                            {t('withdraw.button-label-withdraw')}
                        </Button>
                    </ButtonContainer>
                </FormContainer>
                <BalanceSection>
                    <BalanceDetails />
                </BalanceSection>
            </Wrapper>
            {showWithdrawalConfirmationModal && (
                <WithdrawalConfirmationModal
                    amount={amount}
                    token={getCollaterals(networkId)[selectedToken]}
                    withdrawalAddress={withdrawalWalletAddress}
                    network={networkId}
                    onClose={() => setWithdrawalConfirmationModalVisibility(false)}
                />
            )}
        </>
    );
};

const ButtonContainer = styled(FlexDiv)`
    width: 100%;
    padding: 40px 0px;
    align-items: center;
    justify-content: center;
`;

export default Withdraw;

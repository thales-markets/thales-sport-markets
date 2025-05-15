import particleLogo from 'assets/images/particle_logo.svg?react';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import { LINKS } from 'constants/links';
import { Network } from 'enums/network';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivSpaceBetween, FlexDivStart } from 'styles/common';
import { Coins, formatCurrencyWithKey, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { SUPPORTED_NETWORKS_UNIVERSAL_DEPOSIT } from 'utils/particleWallet/utils';
import { refetchBalances } from 'utils/queryConnector';
import biconomyConnector from 'utils/smartAccount/biconomyWallet';
import useUniversalAccount from 'utils/smartAccount/hooks/useUniversalAccount';
import { sendUniversalTransfer, validateMaxAmount } from 'utils/smartAccount/universalAccount/universalAccount';

type UniversalModal = {
    onClose: () => void;
};

const UniversalModal: React.FC<UniversalModal> = ({ onClose }) => {
    const { t } = useTranslation();

    const { universalAddress, universalSolanaAddress, universalBalance, refetchUnifyBalance } = useUniversalAccount();

    const theme: ThemeInterface = useTheme();

    const [amount, setAmount] = useState<string | number>('');
    const [maxAmount, setMaxAmount] = useState(0);

    const handleCopy = (address: string) => {
        try {
            navigator.clipboard.writeText(address);
            toast.info(`${t('deposit.copied')}: ${truncateAddress(address, 6, 4)}`);
        } catch (e) {
            toast.error('Error');
        }
    };

    const isButtonDisabled =
        !universalBalance?.totalAmountInUSD ||
        universalBalance?.totalAmountInUSD === 0 ||
        Number(amount as any) <= 0 ||
        Number(amount as any) > universalBalance?.totalAmountInUSD;

    useEffect(() => {
        if (universalBalance?.totalAmountInUSD && universalBalance?.totalAmountInUSD > 0) {
            validateMaxAmount(universalBalance.totalAmountInUSD).then((finalAmount) => {
                setMaxAmount(finalAmount);
            });
        }
    }, [universalBalance]);

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
                padding: '0px !important',
            }}
            mobileStyle={{
                container: {
                    borderRadius: 0,
                },
            }}
            title=""
            onClose={onClose}
        >
            {universalAddress !== '' ? (
                <Wrapper>
                    <FlexDivRow>
                        <Title>{t('get-started.universal-account.title')}</Title>
                    </FlexDivRow>
                    <FlexDivSpaceBetween>
                        <HeaderAddresses>{t('get-started.universal-account.address')}</HeaderAddresses>
                        <SupportedChains>
                            {t('get-started.universal-account.supported-chains')}
                            <Tooltip
                                overlay={
                                    <ChainContainer>
                                        {SUPPORTED_NETWORKS_UNIVERSAL_DEPOSIT.map((chain, index) => {
                                            return (
                                                <Chain key={index}>
                                                    <ChainIcon className={`chain-icon chain-icon--${chain.iconName}`} />
                                                    {chain.name}
                                                </Chain>
                                            );
                                        })}
                                    </ChainContainer>
                                }
                                overlayInnerStyle={{ maxWidth: 400 }}
                                iconFontSize={14}
                                marginLeft={3}
                                iconColor={theme.textColor.secondary}
                            />
                        </SupportedChains>
                    </FlexDivSpaceBetween>

                    <DarkBackgroundWrapper>
                        <FieldLabel>{t('get-started.universal-account.evm-label')}</FieldLabel>
                        <ChainWrapper>
                            <Asset className="currency-icon currency-icon--eth" />
                            <FieldHeader>{t('get-started.universal-account.evm')}</FieldHeader>
                        </ChainWrapper>
                        <AddressContainer>
                            <Field onClick={() => handleCopy(universalAddress)}>
                                {universalAddress} <CopyIcon className="icon icon--copy" />
                            </Field>
                        </AddressContainer>
                    </DarkBackgroundWrapper>

                    <DarkBackgroundWrapper>
                        <FieldLabel>{t('get-started.universal-account.solana-label')}</FieldLabel>
                        <ChainWrapper>
                            <Asset className="currency-icon currency-icon--sol" />
                            <FieldHeader>{t('get-started.universal-account.solana')}</FieldHeader>
                        </ChainWrapper>
                        <AddressContainer>
                            <Field onClick={() => handleCopy(universalSolanaAddress)}>
                                {universalSolanaAddress} <CopyIcon className="icon icon--copy" />
                            </Field>
                        </AddressContainer>
                    </DarkBackgroundWrapper>

                    <BalanceWrapper>
                        <BalanceContainer>
                            <FieldHeader>
                                Total Balance{' '}
                                <Tooltip overlay={t('get-started.universal-account.refresh')}>
                                    <Reload onClick={() => refetchUnifyBalance()} className="icon icon--revert" />
                                </Tooltip>
                            </FieldHeader>

                            <Balance>
                                {formatCurrencyWithKey(USD_SIGN, universalBalance?.totalAmountInUSD ?? 0, 2)}
                            </Balance>
                        </BalanceContainer>
                        {universalBalance?.assets
                            .filter((data) => data.tokenType !== 'btc')
                            .map((data) => (
                                <AssetContainer key={data.tokenType}>
                                    <AssetWrapper>
                                        <Asset
                                            className={
                                                COLLATERAL_ICONS_CLASS_NAMES[data.tokenType.toUpperCase() as Coins]
                                            }
                                        />
                                        {data.tokenType}
                                    </AssetWrapper>
                                    <Label>{formatCurrencyWithKey('', data.amount)}</Label>
                                    <Label>{formatCurrencyWithKey(USD_SIGN, data.amountInUSD, 2)}</Label>
                                </AssetContainer>
                            ))}
                    </BalanceWrapper>

                    <ButtonContainer>
                        <NumericInput
                            value={amount}
                            onChange={(_, value) => setAmount(value)}
                            inputFontWeight="700"
                            inputPadding="5px 10px"
                            height="44px"
                            inputFontSize="16px"
                            background={theme.background.quinary}
                            borderColor={theme.background.quinary}
                            fontWeight="700"
                            color={theme.textColor.primary}
                            placeholder={t('liquidity-pool.deposit-amount-placeholder')}
                            onMaxButton={() => setAmount(maxAmount)}
                        />
                        <Button
                            backgroundColor={theme.overdrop.borderColor.tertiary}
                            borderColor={theme.overdrop.borderColor.tertiary}
                            textColor={theme.button.textColor.primary}
                            height="44px"
                            fontSize="16px"
                            fontWeight="700"
                            borderRadius="8px"
                            additionalStyles={{ whiteSpace: 'pre', marginTop: 10 }}
                            disabled={isButtonDisabled}
                            onClick={async () => {
                                if (!isButtonDisabled) {
                                    const id = toast.loading(t('get-started.universal-account.transfer-pending'));
                                    try {
                                        const result = await sendUniversalTransfer(amount as any);
                                        if (result?.success) {
                                            refetchBalances(biconomyConnector.address, Network.OptimismMainnet);
                                            await refetchUnifyBalance();
                                            toast.update(
                                                id,
                                                getSuccessToastOptions(t('get-started.universal-account.success'))
                                            );
                                        } else {
                                            toast.update(id, getErrorToastOptions(result?.message));
                                        }
                                    } catch (e) {
                                        toast.update(
                                            id,
                                            getErrorToastOptions(t('get-started.universal-account.error'))
                                        );
                                        console.log(e);
                                    }
                                }
                            }}
                        >
                            Transfer to <OvertimeAcc className="icon icon--overtime" /> account
                        </Button>
                    </ButtonContainer>
                    <ParticleLogo onClick={() => window.open(LINKS.Particle, '_blank')} />
                </Wrapper>
            ) : (
                <Wrapper>
                    <SimpleLoader />
                </Wrapper>
            )}
        </Modal>
    );
};

const Wrapper = styled.div`
    flex-direction: column;
    display: flex;
    background: ${(props) => props.theme.background.secondary};
    min-width: 300px;
    min-height: 300px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 20px 15px 0 15px;
        min-height: 100vh;
    }
    padding: 25px 30px 0 30px;
`;

const ParticleLogo = styled(particleLogo)`
    margin: 10px auto;
    cursor: pointer;
`;

const DarkBackgroundWrapper = styled(FlexDivColumnCentered)`
    padding: 18px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
    gap: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
`;

const Title = styled.h1`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
    text-transform: uppercase;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 20px;
        white-space: pre;
        gap: 2px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 18px;
        line-height: 18px;
    }
`;

const HeaderAddresses = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    white-space: pre;
    font-size: 14px;
    font-weight: 600;
    line-height: 14px; /* 100% */
    margin-top: 10px;
`;

const SupportedChains = styled(HeaderAddresses)`
    color: ${(props) => props.theme.textColor.secondary};
`;

const Reload = styled.i`
    cursor: pointer;
`;

const FieldHeader = styled.p`
    font-size: 16px;
    font-weight: 500;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
    display: flex;
    align-items: center;
`;

const FieldLabel = styled(FieldHeader)`
    font-size: 12px;
`;

const ButtonContainer = styled(FlexDivColumnCentered)`
    margin-top: 8px;
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
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 12px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        font-size: 10px;
    }
`;

const CopyIcon = styled.i`
    font-size: 30px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.senary};
    cursor: pointer;
    @media (max-width: 575px) {
        font-size: 24px;
    }
`;

const OvertimeAcc = styled.i`
    font-size: 86px;
    font-weight: 400;
    line-height: 18px;
    margin: 0 4px;
`;

const AssetContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column: 1;
    grid-column-end: 4;

    padding: 10px 0;
    padding-left: 20px;
`;

const ChainContainer = styled(AssetContainer)`
    padding: 10px 0;
    gap: 10px;
`;

const AssetWrapper = styled.p<{ clickable?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 700;
    white-space: pre;
    text-transform: uppercase;

    cursor: ${(props) => (props.clickable ? 'pointer' : '')};
    gap: 8px;
`;

const ChainIcon = styled.i`
    font-size: 16px;
    font-weight: 100;
    color: ${(props) => props.theme.textColor.secondary};
`;

const ChainWrapper = styled(FlexDivStart)`
    align-items: center;
`;
const Label = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
`;

const Chain = styled(Label)`
    font-size: 12px;
    gap: 2px;
    justify-content: flex-start;
`;

const Asset = styled.i`
    font-size: 24px;
    line-height: 24px;
    font-weight: 100;
    width: 30px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const BalanceWrapper = styled(DarkBackgroundWrapper)`
    padding: 0;
    gap: 0;
`;

const Balance = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 20px;
    font-weight: 700;
    display: flex;
    height: 44px;
    padding: 10px 8px 10px 13px;
    justify-content: flex-end;
    align-items: center;
    border-radius: 12px;
    border: 0px solid #e5e7eb;
    background: rgba(63, 255, 255, 0.1);
    margin-right: 10px;
    white-space: pre;
`;

const BalanceContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 14px 0;
    padding-left: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid ${(props) => props.theme.textColor.secondary};
`;

export default UniversalModal;

import particle from 'assets/images/particle.png';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { CloseIcon, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { Coins, formatCurrencyWithKey, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { sendUniversalTranser } from 'utils/biconomy';
import useBiconomy from 'utils/useBiconomy';

type UniversalModal = {
    onClose: () => void;
};

const UniversalModal: React.FC<UniversalModal> = ({ onClose }) => {
    const { t } = useTranslation();

    const { universalAddress, universalBalance } = useBiconomy();

    const theme: ThemeInterface = useTheme();

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(universalAddress);
            toast.info(`${t('deposit.copied')}: ${truncateAddress(universalAddress, 6, 4)}`);
        } catch (e) {
            toast.error('Error');
        }
    };

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
                            i18nKey="get-started.universal-account.title"
                            components={{
                                icon: <OvertimeIcon src={particle} />,
                            }}
                        />
                    </Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </FlexDivRow>

                <WalletContainer>
                    <FieldHeader>{t('get-started.universal-account.address')}</FieldHeader>

                    <AddressContainer>
                        <Field onClick={handleCopy}>
                            {universalAddress} <CopyIcon className="icon icon--copy" />
                        </Field>
                    </AddressContainer>
                </WalletContainer>

                <BalanceContainer>
                    <FieldHeader>Total Balance</FieldHeader>
                    <div></div>
                    <Label>{formatCurrencyWithKey(USD_SIGN, universalBalance?.totalAmountInUSD ?? 0, 2)}</Label>
                </BalanceContainer>

                {universalBalance?.assets.map((data) => (
                    <AssetContainer key={data.tokenType}>
                        <AssetWrapper>
                            <Asset className={COLLATERAL_ICONS_CLASS_NAMES[data.tokenType.toUpperCase() as Coins]} />
                            {data.tokenType}
                        </AssetWrapper>
                        <Label>{formatCurrencyWithKey('', data.amount)}</Label>
                        <Label>{formatCurrencyWithKey(USD_SIGN, data.amountInUSD, 2)}</Label>
                    </AssetContainer>
                ))}

                <ButtonContainer>
                    <Button
                        backgroundColor={theme.overdrop.borderColor.tertiary}
                        borderColor={theme.overdrop.borderColor.tertiary}
                        textColor={theme.button.textColor.primary}
                        height="44px"
                        fontSize="16px"
                        fontWeight="700"
                        borderRadius="8px"
                        onClick={async () => {
                            if (universalBalance?.totalAmountInUSD && universalBalance?.totalAmountInUSD > 3) {
                                const id = toast.loading(t('get-started.universal-account.transfer-pending'));
                                try {
                                    await sendUniversalTranser(universalBalance?.totalAmountInUSD + '');
                                    toast.update(
                                        id,
                                        getSuccessToastOptions(t('get-started.universal-account.success'))
                                    );
                                    onClose();
                                } catch (e) {
                                    toast.update(id, getErrorToastOptions(t('get-started.universal-account.error')));
                                    console.log(e);
                                }
                            }
                        }}
                    >
                        Transfer to <OvertimeAcc className="icon icon--overtime" /> account
                    </Button>
                </ButtonContainer>
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled.div`
    flex-direction: column;
    display: flex;
`;

const OvertimeIcon = styled.img`
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
    gap: 8px;
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.octonary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
    text-transform: uppercase;
    @media (max-width: 512px) {
        font-size: 20px;
        white-space: pre;
        gap: 2px;
    }
    @media (max-width: 412px) {
        font-size: 18px;
        line-height: 18px;
    }
`;

const FieldHeader = styled.p`
    font-size: 16px;
    font-weight: 700;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    margin-top: 40px;
    gap: 4px;
`;

const ButtonContainer = styled(FlexDivColumnCentered)`
    margin-top: 30px;
`;

const BalanceContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column: 1;
    grid-column-end: 4;
    margin-top: 20px;
    margin-bottom: 10px;
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
    @media (max-width: 575px) {
        font-size: 12px;
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

    border-top: 1px solid ${(props) => props.theme.background.senary};
    padding: 14px 0;
    padding-left: 20px;
`;

const AssetWrapper = styled.p<{ clickable?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;

    cursor: ${(props) => (props.clickable ? 'pointer' : '')};
    gap: 8px;
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

const Asset = styled.i`
    font-size: 24px;
    line-height: 24px;
    width: 30px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default UniversalModal;

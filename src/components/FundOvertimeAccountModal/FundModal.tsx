import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';
import { getInfoToastOptions, getErrorToastOptions } from 'config/toast';
import QRCodeModal from 'pages/AARelatedPages/Deposit/components/QRCodeModal';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { useAccount, useChainId } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { t } = useTranslation();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';
    const theme = useTheme();
    const networkId = useChainId();

    const [showQRModal, setShowQRModal] = useState<boolean>(false);

    const handleCopy = () => {
        const id = toast.loading(t('deposit.copying-address'));
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('deposit.copied')));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
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
                <Title>
                    <Trans
                        i18nKey="get-started.fund-account.title"
                        components={{
                            icon: <OvertimeIcon className="icon icon--overtime" />,
                        }}
                    />
                </Title>

                <SubTitle>
                    {t('get-started.fund-account.subtitle')}
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-1')}
                    ></Tooltip>
                </SubTitle>

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
                    <FlexDivCentered gap={20}>
                        <Field>{walletAddress}</Field>
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
                    </FlexDivCentered>
                </WalletContainer>

                <Container>
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-3')}
                    >
                        <Box>
                            <FieldHeader>{t('get-started.fund-account.from-exchange')}</FieldHeader>
                            <Icon className="icon icon--affiliate" />
                        </Box>
                    </Tooltip>

                    <Box>
                        <FieldHeader>{t('get-started.fund-account.buy-crypto')}</FieldHeader>
                        <Icon className="icon icon--card" />
                    </Box>
                    <Tooltip
                        customIconStyling={{ color: theme.textColor.secondary }}
                        overlay={t('get-started.fund-account.tooltip-4')}
                    >
                        <Box>
                            <FieldHeader>{t('get-started.fund-account.from-wallet')}</FieldHeader>
                            <Icon className="icon icon--wallet-connected" />
                        </Box>
                    </Tooltip>
                </Container>

                <BlueField>
                    <FieldText>{t('get-started.fund-account.next')}</FieldText>
                </BlueField>

                <SkipText onClick={onClose}>{t('get-started.fund-account.skip')}</SkipText>
            </Wrapper>
            {showQRModal && (
                <QRCodeModal title="" onClose={() => setShowQRModal(false)} walletAddress={walletAddress} />
            )}
        </Modal>
    );
};

const Wrapper = styled.div`
    max-width: 800px;
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

const Container = styled(FlexDivCentered)`
    margin-top: 14px;
    margin-bottom: 43px;
    gap: 16px;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    margin-top: 30px;
    gap: 14px;
`;

const Box = styled(FlexDivCentered)`
    border: 1px solid ${(props) => props.theme.textColor.secondary};
    border-radius: 8px;
    padding: 14px;
    gap: 14px;
    justify-content: space-between;
    min-width: 200px;
    height: 60px;
    cursor: pointer;
`;

const Field = styled.div`
    height: 44px;
    background: ${(props) => props.theme.textColor.primary};
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
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

const SkipText = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    margin-top: 30px;
    cursor: pointer;
`;

export default FundModal;

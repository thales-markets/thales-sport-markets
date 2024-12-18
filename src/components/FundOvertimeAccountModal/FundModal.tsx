import Modal from 'components/Modal';
import { getInfoToastOptions, getErrorToastOptions } from 'config/toast';
import { t } from 'i18next';

import React from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { useAccount } from 'wagmi';

type FundModalProps = {
    onClose: () => void;
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

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
        <Modal hideHeader title="" onClose={onClose}>
            <Wrapper>
                <Title>Fund Overtime Account</Title>
                <SubTitle>Add funds to your smart account to get started.</SubTitle>
                <Box>
                    <FlexDivColumnCentered>
                        <Description>
                            Your Overtime Account is a smart wallet that enables seamless trading. Fund it with crypto
                            from your wallet, centralized exchanges, or buy directly using fiat.
                        </Description>
                        <Info>What is an Overtime Account?</Info>
                    </FlexDivColumnCentered>
                </Box>

                <WalletContainer>
                    <FieldHeader>Your Deposit Address</FieldHeader>
                    <FlexDivCentered gap={20}>
                        <Field>{walletAddress}</Field>
                        <BlueField onClick={handleCopy}>Copy</BlueField>
                    </FlexDivCentered>
                </WalletContainer>

                <Container>
                    <Box>
                        <FieldContainer>
                            <FieldHeader>Deposit from Wallet</FieldHeader>
                            <FieldInfo>Select tokens to transfer from your connected wallet</FieldInfo>
                        </FieldContainer>
                        <Icon className="icon icon--wallet-connected" />
                    </Box>
                    <Box>
                        <FieldContainer>
                            <FieldHeader>Buy Crypto</FieldHeader>
                            <FieldInfo>Use fiat to buy crypto instantly</FieldInfo>
                        </FieldContainer>
                        <Icon className="icon icon--card" />
                    </Box>
                    <Box>
                        <FieldContainer>
                            <FieldHeader>Deposit from CEX</FieldHeader>
                            <FieldInfo>Fund from Binance, Coinbase, or other exchanges</FieldInfo>
                        </FieldContainer>
                        <Icon className="icon icon--affiliate" />
                    </Box>
                </Container>
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled.div`
    max-width: 500px;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 15px;
`;

const SubTitle = styled.h1`
    font-weight: 600;
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
`;

const Description = styled.h1`
    font-weight: 400;
    font-size: 16px;
    line-height: normal;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: center;
`;

const FieldHeader = styled.p`
    font-weight: 400;
    font-size: 16px;
    line-height: normal;
    color: ${(props) => props.theme.textColor.primary};
`;

const Container = styled(FlexDivColumnCentered)`
    margin-top: 38px;
    gap: 16px;
`;

const WalletContainer = styled(FlexDivColumnCentered)`
    margin-top: 30px;
    gap: 14px;
`;

const FieldContainer = styled(FlexDivColumnCentered)`
    gap: 4px;
    padding: 6px;
`;

const FieldInfo = styled.p`
    font-weight: 400;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const Box = styled.div`
    position: relative;
    border: 1px solid ${(props) => props.theme.textColor.secondary};
    border-radius: 8px;
    padding: 10px;
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
    background: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.senary};
    flex: 1;
    font-weight: 600;
    cursor: pointer;
`;

const Info = styled.p`
    font-weight: 400;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
    margin-top: 10px;
    margin-bottom: 4px;
`;

const Icon = styled.i`
    font-weight: 400;
    font-size: 20px;
    color: ${(props) => props.theme.textColor.quaternary};
    position: absolute;
    top: 24px;
    right: 20px;
`;

export default FundModal;

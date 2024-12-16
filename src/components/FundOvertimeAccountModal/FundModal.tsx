import Modal from 'components/Modal';

import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

const FundModal: React.FC<any> = () => {
    return (
        <Modal hideHeader title="" onClose={() => {}}>
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
                        <Field>0xb8D08D9537FC8E5624c298302137c5b5ce2F301D</Field>
                        <BlueField>Copy</BlueField>
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

import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Wrapper = styled(FlexDiv)`
    align-items: flex-start;
    flex-direction: row;
    width: 100%;
    max-width: 1080px;
    gap: 20px;
    flex: 1;
    margin-top: 40px;
    @media (max-width: 800px) {
        margin-top: 20px;
        flex-direction: column;
    }
`;

export const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    flex: 6;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

export const BalanceSection = styled(FlexDiv)`
    flex-direction: column;
    flex: 4;
    @media (max-width: 575px) {
        padding: 0;
        width: 100%;
    }
`;

export const PrimaryHeading = styled.h1`
    font-size: 20px;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 20px;
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    width: 100%;
    margin-bottom: 10px;
`;

export const CollateralContainer = styled.div`
    position: relative;
    width: 100%;
    margin-left: auto;
    border-radius: 5px;
    padding: 8px;
    max-height: 30px;
    display: flex;
    justify-content: end;
    align-items: center;
    background: ${(props) => props.theme.background.secondary};
    cursor: pointer;
`;

export const WarningContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.connectWalletModal.warningBackground};
    color: ${(props) => props.theme.connectWalletModal.warningText};
    padding: 5px;
    align-items: center;
    font-weight: 400;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 18px;
    @media (max-width: 575px) {
        font-size: 12px;
    }
`;

export const WarningIcon = styled.i`
    padding-right: 12px;
    padding-left: 5px;
`;

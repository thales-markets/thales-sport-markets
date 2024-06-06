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
    font-weight: 800;
    text-transform: uppercase;
    line-height: 20px;
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-weight: 400;
    line-height: 119%; /* 14.28px */
    margin-top: 4px;
`;

export const WarningLabel = styled(Label)`
    margin-top: 2px;
`;

export const DescriptionLabel = styled(Label)`
    margin-bottom: 20px;
`;

export const InputLabel = styled.span<{ marginTop?: string }>`
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    margin-top: ${(props) => (props.marginTop ? props.marginTop : '')};
    margin-bottom: 5px;
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    width: 100%;
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

import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';

export const SpaContainer = styled(FlexDivColumn)`
    border-radius: 15px;
    :not(:last-child) {
        margin-right: 25px;
    }
    background: linear-gradient(180deg, #2b2f4a 0%, #24273d 100%);
    :hover {
        background: linear-gradient(180deg, #2b2f4a 0%, #333a69 100%);
    }
    cursor: pointer;
    @media (max-width: 767px) {
        width: 100%;
        align-self: center;
        :not(:last-child) {
            margin-right: 0;
            margin-bottom: 20px;
        }
    }
    align-self: stretch;
    a {
        height: 100%;
    }
    max-width: 400px;
`;

export const DeprecatedInfo = styled(FlexDiv)`
    height: 50px;
    background-color: ${(props) => props.theme.background.tertiary};
    border-radius: 15px 15px 0px 0px;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    @media (max-width: 767px) {
        font-size: 16px;
    }
`;

export const VaultContainer = styled(FlexDivColumn)`
    align-items: start;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    padding: 30px 40px 30px 40px;
    @media (max-width: 767px) {
        padding: 20px 20px 20px 20px;
    }
    height: 100%;
`;

export const VaultTopWrapper = styled(FlexDivColumn)<{ deprecatedVault?: boolean }>`
    flex-grow: ${(props) => (props.deprecatedVault ? 0 : 1)};
`;

export const VaultBottomWrapper = styled(FlexDivRowCentered)`
    align-self: center;
    flex: initial;
    margin-top: 10px;
    width: 100%;
`;

export const VaultTitle = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 22px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
    width: 100%;
    text-align: center;
`;

export const VaultSectionDescription = styled.span`
    font-weight: 400;
    font-size: 14px;
`;

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 105px;
    width: 100%;
`;

export const VaultInfoContainer = styled(FlexDivColumn)`
    font-size: 18px;
    span {
        font-size: 20px;
        font-weight: 600;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    margin-top: 10px;
    white-space: nowrap;
`;

export const VaultInfoLabel = styled.p``;

export const VaultInfo = styled.p<{ color: string }>`
    color: ${(props) => props.color};
    font-weight: 600;
    font-size: 20px;
    margin-top: 4px;
`;

export const TitleVaultIcon = styled.i`
    font-weight: 400;
    font-size: 28px;
    margin-right: 8px;
    top: -2px;
    position: relative;
`;

export const VaultSectionIcon = styled.i`
    font-weight: 400;
    font-size: 25px;
    margin-right: 8px;
    top: -2px;
    position: relative;
`;

export const NewBadge = styled.div`
    position: relative;
    background-color: ${(props) => props.theme.button.background.primary};
    border-radius: 5px;
    color: ${(props) => props.theme.textColor.primary};
    display: inline-block;
    font-size: 12px;
    line-height: 12px;
    padding: 4px 5px 3px 5px;
    margin-left: 5px;
    top: -12px;
`;

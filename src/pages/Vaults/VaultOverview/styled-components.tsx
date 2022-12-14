import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';

export const SpaContainer = styled(FlexDivColumn)`
    border-radius: 15px;
    :not(:last-child) {
        margin-right: 25px;
    }
    background: linear-gradient(180deg, #2b2f4a 0%, rgba(43, 47, 74, 0) 100%);
    :hover {
        background: linear-gradient(180deg, #2b2f4a 0%, #333a69 100%);
    }
    cursor: pointer;
    @media (max-width: 767px) {
        width: 100%;
        :not(:last-child) {
            margin-right: 0;
            margin-bottom: 20px;
        }
    }
    align-self: stretch;
    a {
        height: 100%;
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

export const VaultTopWrapper = styled(FlexDivColumn)``;

export const VaultBottomWrapper = styled(FlexDivColumn)`
    align-self: center;
    flex: initial;
    margin-top: 10px;
`;

export const VaultTitle = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    line-height: 25px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: 2px solid #5f6180;
    text-align: center;
`;

export const VaultSectionTitle = styled.span`
    text-align: start;
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 20px;
    margin-top: 20px;
`;

export const VaultSectionDescription = styled.span`
    text-align: justify;
    font-weight: 400;
    font-size: 16px;
`;

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 250px;
    width: 100%;
`;

export const VaultInfoContainer = styled(FlexDivColumn)`
    align-items: center;
    font-size: 18px;
    span {
        font-size: 20px;
        font-weight: 600;
        color: #3fd1ff;
    }
    margin-top: 10px;
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

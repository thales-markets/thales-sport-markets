import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivStart,
} from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 80%;
    position: relative;
    align-items: start;
    margin-top: 30px;
    @media (max-width: 1440px) {
        width: 95%;
    }
    @media (max-width: 767px) {
        flex-direction: column;
        margin-top: 10px;
    }
`;

export const DeprecatedContainer = styled(FlexDiv)`
    width: 80%;
    background-color: ${(props) => props.theme.background.tertiary};
    border-radius: 15px;
    height: 50px;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    padding: 5px 10px;
    text-align: center;
    @media (max-width: 767px) {
        font-size: 16px;
        margin-top: 10px;
    }
`;

const ContentContainer = styled(FlexDivColumn)`
    width: 100%;
    flex: initial;
    align-items: center;
    position: relative;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    p {
        margin-bottom: 10px;
    }
`;

export const LeftContainer = styled(ContentContainer)`
    margin-right: 20px;
    @media (max-width: 767px) {
        margin-right: 0px;
        padding-top: 0px;
    }
`;

export const RightContainer = styled(ContentContainer)`
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    padding: 30px 40px 20px 40px;
    border-radius: 10px;
    @media (max-width: 767px) {
        padding: 20px 20px 10px 20px;
    }
`;

export const RoundInfoWrapper = styled(FlexDivColumn)`
    width: 80%;
    @media (max-width: 1440px) {
        width: 95%;
    }
    padding: 20px;
    margin-top: 20px;
`;

export const RoundEndContainer = styled(FlexDivColumn)`
    align-items: center;
    font-size: 20px;
    span {
        font-size: 30px;
        font-weight: 600;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    margin-bottom: 15px;
`;

export const RoundEndLabel = styled.p`
    margin-bottom: 10px;
`;

export const RoundEnd = styled.p`
    font-weight: 600;
    font-size: 25px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const RoundAllocationWrapper = styled(FlexDivCentered)`
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

export const RoundAllocationContainer = styled(FlexDivColumn)`
    align-items: center;
    max-width: 200px;
    :not(:last-child) {
        border-right: 2px solid ${(props) => props.theme.borderColor.primary};
    }
    padding: 5px 0;
    @media (max-width: 767px) {
        :not(:last-child) {
            border-right: none;
        }
    }
`;

export const RoundAllocationLabel = styled.p`
    margin-bottom: 6px;
`;

export const RoundAllocation = styled.p`
    font-size: 25px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const RoundInfoContainer = styled(FlexDivColumn)`
    align-items: center;
`;

export const RoundInfo = styled.p`
    font-size: 20px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const Description = styled.div`
    font-size: 18px;
    line-height: 22px;
    text-align: justify;
    p {
        margin-bottom: 10px;
    }
    ul {
        list-style: initial;
        margin-left: 20px;
    }
    li {
        margin-bottom: 4px;
    }
`;

export const ContentInfoContainer = styled.div`
    margin-bottom: 15px;
`;

export const ContentInfo = styled.p`
    text-align: center;
`;

export const WarningContentInfo = styled(ContentInfo)`
    color: ${(props) => props.theme.warning.textColor.primary};
`;

export const BoldContent = styled.span`
    font-weight: 600;
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 30px;
    margin-top: 30px;
    @media (max-width: 767px) {
        margin-top: 0px;
    }
`;
export const TitleVaultIcon = styled.i`
    font-weight: 400;
    font-size: 30px;
    margin-right: 8px;
    top: -3px;
    position: relative;
`;

export const UsersInVaultText = styled(ContentInfo)`
    margin-top: 20px;
    margin-bottom: 10px;
`;

export const VaultFilledText = styled(ContentInfo)`
    margin-top: 10px;
    margin-bottom: 10px;
`;

export const VaultFilledGraphicContainer = styled(FlexDivStart)`
    position: relative;
    width: 400px;
    height: 14px;
    background: rgba(100, 217, 254, 0.2);
    border-radius: 15px;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        width: 250px;
    }
`;

export const VaultFilledGraphicPercentage = styled(FlexDivStart)<{ width: number }>`
    position: absolute;
    width: ${(props) => props.width}%;
    transition: width 1s linear;
    max-width: 400px;
    height: 10px;
    left: 2px;
    top: 2px;
    background: linear-gradient(270deg, #3fd1ff 16.01%, #15bba7 89.24%);
    border-radius: 15px;
    @media (max-width: 575px) {
        max-width: 250px;
    }
`;

export const ButtonContainer = styled(FlexDivCentered)<{ mobileDirection?: string }>`
    @media (max-width: 675px) {
        flex-direction: ${(props) => props.mobileDirection || 'column'};
        button {
            margin: 10px 10px;
            :first-child {
                margin-bottom: ${(props) => (props.mobileDirection ? '20px' : '10px')};
            }
            :last-child {
                margin-bottom: ${(props) => (props.mobileDirection ? '10px' : '20px')};
            }
        }
    }
`;

export const InputContainer = styled(FlexDivColumnCentered)`
    margin-top: 20px;
    margin-bottom: 10px;
`;

export const LeftLoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 240px;
    width: 100%;
`;

export const RightLoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 350px;
    width: 100%;
`;

export const ToggleContainer = styled(FlexDiv)`
    font-weight: 600;
    margin-bottom: 20px;
    width: 100%;
    text-transform: uppercase;
    border-bottom: 2px solid ${(props) => props.theme.borderColor.primary};
    padding-bottom: 20px;
`;

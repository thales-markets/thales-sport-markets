import { Tooltip, withStyles } from '@material-ui/core';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivStart,
    FlexDivRow,
    FlexDiv,
} from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 60%;
    position: relative;
    align-items: start;
    @media (max-width: 1440px) {
        width: 95%;
    }
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

export const ContentContainer = styled(FlexDivColumn)`
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
    padding-top: 30px;
    @media (max-width: 767px) {
        margin-right: 0px;
        padding-top: 0px;
    }
`;

export const RightContainer = styled(ContentContainer)`
    background: ${(props) => props.theme.background.secondary};
    padding: 30px 40px 20px 40px;
    border-radius: 20px;
    @media (max-width: 767px) {
        padding: 20px 20px 10px 20px;
    }
`;

export const RoundInfoWrapper = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        flex-direction: column;
    }
`;

export const RoundInfoContainer = styled(FlexDivColumn)`
    align-items: center;
    color: #3fd1ff;
    span {
        color: #3fd1ff;
        font-weight: 600;
    }
    @media (max-width: 575px) {
        :first-child {
            margin-bottom: 10px;
        }
    }
`;

export const RoundInfoLabel = styled.p``;

export const RoundInfo = styled.p`
    font-size: 20px;
    font-weight: 600;
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
    color: #ffcc00;
`;

export const BoldContent = styled.span`
    font-weight: 600;
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    margin-top: 30px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 40px;
`;

export const VaultFilledText = styled(ContentInfo)`
    margin-top: 20px;
    margin-bottom: 10px;
`;

export const VaultFilledGraphicContainer = styled(FlexDivStart)`
    position: relative;
    width: 400px;
    height: 14px;
    background: rgba(100, 217, 254, 0.2);
    border-radius: 15px;
    margin-bottom: 10px;
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

export const SubmitButton = styled.button`
    background: linear-gradient(88.84deg, #2fc9dd 19.98%, #1ca6b9 117.56%);
    border-radius: 8px;
    margin: 20px 20px;
    font-size: 20px;
    font-weight: 700;
    line-height: 23px;
    color: #1a1c2b;
    width: 252px;
    border: none;
    padding: 7px;
    cursor: pointer;
    text-transform: uppercase;
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const CloseRoundButton = styled(SubmitButton)`
    margin: 0;
    width: auto;
    font-size: 12px;
    font-weight: 700;
    line-height: 12px;
    top: -2px;
    position: relative;
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
    input {
        background: ${(props) => props.theme.input.background.primary};
        border-radius: 5px;
        border: 2px solid ${(props) => props.theme.borderColor.tertiary};
        color: ${(props) => props.theme.input.textColor.primary};
        width: 300px;
        height: 34px;
        padding-left: 10px;
        padding-right: 60px;
        font-size: 18px;
        outline: none;
        &::placeholder {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &:focus {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .currency-label {
        padding: 9px 10px 10px 0;
    }
`;

export const InputLabel = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    margin-bottom: 6px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const ValidationTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '100%',
        margin: '1px',
        backgroundColor: '#FDB7B7',
        color: '#F30101',
        fontSize: '12px',
    },
}))(Tooltip);

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 350px;
    width: 100%;
`;

export const TabContainer = styled(FlexDiv)`
    height: 40px;
    margin-bottom: 30px;
    width: 100%;
`;

export const Tab = styled(FlexDivCentered)<{ isActive: boolean; index: number }>`
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 48px;
    color: #f6f6fe;
    user-select: none;
    border-bottom: 5px solid rgba(100, 217, 254, 0.3);
    width: 100%;
    text-transform: uppercase;
    &.selected {
        transition: 0.2s;
        color: #f6f6fe;
        border-bottom: 5px solid #64d9fe;
    }
    &:hover:not(.selected) {
        cursor: pointer;
        color: #00f9ff;
    }
`;

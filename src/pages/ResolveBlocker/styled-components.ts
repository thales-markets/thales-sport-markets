import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    margin-top: 30px;
    justify-content: start;
    max-width: 1080px;
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`;

export const HeadeContainer = styled(FlexDivSpaceBetween)`
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

export const TabContainer = styled(FlexDiv)`
    min-height: 38px;
`;

export const Tab = styled(FlexDivCentered)<{ isActive: boolean; index: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    user-select: none;
    margin-bottom: 20px;
    margin-right: 40px;
    color: ${(props) => props.theme.textColor.secondary};
    &.selected {
        transition: 0.2s;
        color: ${(props) => props.theme.textColor.primary};
    }
    &:hover:not(.selected) {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 767px) {
        font-size: 15px;
        margin-bottom: 10px;
        margin-right: 20px;
    }
`;

export const ExternalLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
    &:hover {
        text-decoration: underline;
    }
`;

export const CheckboxContainer = styled(FlexDivCentered)`
    margin: -20px 0 0 10px;
    @media (max-width: 767px) {
        margin: 0px 0px 10px 0;
    }
`;

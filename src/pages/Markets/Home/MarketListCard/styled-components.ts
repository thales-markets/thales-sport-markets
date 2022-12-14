import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled.div<{
    isResolved?: boolean;
}>`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 6px 8px 4px 8px;
    border-radius: 5px;
    margin-bottom: 8px;
    background-color: ${(props) => (props.isResolved ? 'rgb(36,41,64, 0.5)' : 'rgba(48, 54, 86, 0.5)')};
    @media (max-width: 575px) {
        margin-bottom: 5px;
    }
`;

export const MatchInfoConatiner = styled(FlexDivColumn)`
    cursor: pointer;
`;

export const MatchTimeLabel = styled.label`
    font-size: 11px;
    text-transform: uppercase;
`;

export const TeamsInfoConatiner = styled(FlexDivRow)`
    align-items: center;
    margin-top: 6px;
`;

export const TeamLogosConatiner = styled(FlexDivRow)`
    align-items: center;
`;

export const ClubLogo = styled.img<{ width?: string; height?: string }>`
    height: ${(props) => (props?.height ? props.height : '27px')};
    width: ${(props) => (props?.width ? props.width : '27px')};
`;

export const VSLabel = styled.span`
    margin: 0 4px;
    font-weight: 400;
    font-size: 11px;
`;

export const TeamNamesConatiner = styled(FlexDivColumn)`
    margin-left: 6px;
    @media (max-width: 575px) {
        margin-left: 0px;
    }
`;

export const TeamNameLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const ResultWrapper = styled(FlexDivRowCentered)``;

export const Result = styled.span`
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2em;
`;

export const ResultLabel = styled.span`
    font-weight: 300;
    font-size: 12px;
    margin-right: 6px;
    text-transform: uppercase;
`;

export const OddsWrapper = styled(FlexDivRow)``;

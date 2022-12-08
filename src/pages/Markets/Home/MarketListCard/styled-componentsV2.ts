import { ODDS_COLOR } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled.div<{
    claimBorder?: boolean;
    isResolved?: boolean;
    isMobile?: boolean;
}>`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 6px 8px 4px 8px;
    border-radius: 5px;
    margin-bottom: 15px;
    background-color: ${(props) =>
        props.isResolved && !props.claimBorder ? 'rgb(36,41,64, 0.5)' : 'rgba(48, 54, 86, 0.5)'};
    border: ${(props) => (props?.claimBorder ? '3px solid #3FD1FF' : '')};
    flex-grow: ${(props) => (props?.isMobile ? '1' : '')};
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
`;

export const TeamNameLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const BetTypeContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    font-weight: bold;
`;

export const LinkIcon = styled.i<{ isMobile?: boolean }>`
    font-size: 16px;
    margin-left: ${(props) => (props?.isMobile ? '' : '10px')};
    margin-top: ${(props) => (props?.isMobile ? '' : '12px')};
    color: ${(props) => props.theme.textColor.secondary};
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const MatchInfoMobile = styled(FlexDivColumn)`
    width: fit-content;
    justify-content: space-between;
`;

export const MatchInfoLabelMobile = styled.label<{ home?: boolean; away?: boolean }>`
    font-size: 11px;
    color: ${(props) =>
        props?.home ? ODDS_COLOR.HOME : props?.away ? ODDS_COLOR.AWAY : props.theme.textColor.primary};
    text-transform: uppercase;
`;

export const VSLabelMobile = styled.span`
    margin: 0 5px;
    font-size: 11px;
`;

export const LinkWrapper = styled(FlexDivRow)`
    flex-grow: 0.25;
    justify-content: end;
    align-items: center;
    align-self: auto;
`;

export const MatchNamesContainerMobile = styled(FlexDivRow)`
    width: 77%;
    justify-content: space-between;
    > :first-child {
        width: 45%;
        text-align: end;
    }
    > :last-child {
        width: 45%;
    }
    @media (max-width: 500px) {
        width: 50%;
    }
`;

export const OddsWrapper = styled(FlexDivRow)``;

export const OddsWrapperMobile = styled(FlexDivRow)<{ closedMarket?: boolean }>`
    flex: 1;
    align-self: ${(props) => (props?.closedMarket ? 'end' : '')};
`;

export const ResultWrapper = styled(FlexDivRowCentered)`
    margin-left: 15px;
    min-width: 90px;
    margin-right: 5px;
    justify-content: flex-start;
`;

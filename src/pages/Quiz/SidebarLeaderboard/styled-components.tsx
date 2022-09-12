import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivStart } from 'styles/common';

export const LeaderboardWrapper = styled(FlexDivColumn)`
    margin-top: 30px;
`;

export const Container = styled(FlexDivColumn)`
    cursor: pointer;
`;

export const LeaderboardContainer = styled(FlexDivColumn)`
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    padding: 10px 0;
    margin-top: 20px;
`;

export const Title = styled(FlexDivStart)`
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    line-height: 100%;
    justify-content: center;
    color: ${(props) => props.theme.textColor.secondary};
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const LeaderboardIcon = styled.i`
    font-size: 25px;
    margin-right: 6px;
    &:before {
        font-family: OvertimeIcons !important;
        content: '\\0053';
    }
`;

export const LeaderboardRow = styled(FlexDivStart)`
    height: 44px;
    align-items: center;
`;

export const Rank = styled(FlexDivCentered)`
    font-weight: 700;
    font-size: 15px;
    width: 35px;
`;

export const MainInfo = styled(FlexDivColumn)``;

export const Twitter = styled(FlexDivColumn)`
    font-weight: 600;
    font-size: 14px;
    line-height: 103.19%;
`;

export const Rewards = styled(FlexDivColumn)`
    font-weight: 300;
    font-size: 12px;
    line-height: 103.19%;
`;

export const PointsInfo = styled(FlexDivColumn)`
    align-items: center;
    max-width: 60px;
`;

export const Points = styled(FlexDivColumn)`
    font-weight: 300;
    font-size: 14px;
    line-height: 103.19%;
`;

export const PointsLabel = styled(FlexDivColumn)`
    font-weight: 600;
    font-size: 12px;
    line-height: 103.19%;
    text-transform: uppercase;
`;

export const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    &:hover {
        .twitter {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

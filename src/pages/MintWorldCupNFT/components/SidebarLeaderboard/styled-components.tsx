import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { ReactComponent as Logo } from 'assets/images/zebro-fifa-campaign.svg';

export const LeaderboardWrapper = styled(FlexDiv)`
    margin-top: 30px;
    flex-direction: column;
`;

export const Container = styled(FlexDivColumn)`
    background: radial-gradient(
        50% 88.89% at 50% 50%,
        rgba(138, 21, 56, 0.8) 0%,
        rgba(92, 12, 36, 0.8) 60.5%,
        rgba(49, 0, 15, 0.8) 95.48%
    );
    border-radius: 6px;
`;

export const LeaderboardContainer = styled(FlexDivColumn)`
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: -10px;
`;

export const Title = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    flex-direction: column;
    &:hover {
        color: #ff004b;
        cursor: pointer;
    }
`;

export const HeaderRow = styled(FlexDivRow)`
    border-top: 1px solid #ff004b;
    padding-top: 5px;
    justify-content: space-around;
    margin-bottom: 5px;
`;

export const LeaderboardRow = styled(FlexDivRow)`
    height: 44px;
    align-items: center;
    &.first {
        border-top: 2px solid #ff004b;
        border-bottom: 2px solid #ff004b;
    }
`;

export const Rank = styled(FlexDivCentered)`
    font-weight: 700;
    font-size: 12px;
    margin: 0px 5px;
    width: 15px;
`;

export const DataLabel = styled(FlexDivColumn)`
    font-weight: 400;
    font-size: 12px;
    line-height: 103.19%;
`;

export const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
`;

export const ColumnLabel = styled.span`
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
    line-height: 103.19%;
    width: 100%;
`;

export const ColumnWrapper = styled(FlexDiv)`
    width: 32%;
    align-items: center;
    justify-content: center;
    text-align: center;
    &:first-child {
        width: 36%;
    }
    &:last-child {
        margin-right: 5px;
    }
`;

export const NftImage = styled.img`
    border-radius: 50%;
    height: 30px;
    width: 30px;
    color: #ffffff;
    margin-right: 6px;
    @media (max-width: 767px) {
        height: 25px;
        width: 25px;
    }
    @media (max-width: 512px) {
        height: 20px;
        width: 20px;
    }
`;

export const CampaignLogo = styled(Logo)`
    height: 100px;
    width: 100px;
    display: flex;
    flex: 1 1 100%;
    margin-top: -20px;
    :hover {
        cursor: pointer;
        filter: invert(34%) sepia(100%) saturate(7499%) hue-rotate(336deg) brightness(101%) contrast(113%);
    }
`;

export const OverlayContainer = styled(FlexDivColumn)`
    text-align: center;
    text-transform: uppercase;
`;

import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import { ReactComponent as ThalesLogo } from 'assets/images/thales-logo-small-white.svg';
import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivRowCentered,
} from 'styles/common';

export const LeaderboardWrapper = styled(FlexDiv)`
    margin-top: 30px;
    flex-direction: column;
`;

export const Container = styled(FlexDivColumn)`
    background: linear-gradient(180deg, #303656 54%, rgba(48, 54, 86, 0) 108.5%);
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
    margin: 10px 0 15px 0;
    flex-direction: column;
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
        cursor: pointer;
    }
`;

export const TitleLabel = styled.span<{ isBold?: boolean }>`
    font-weight: ${(props) => (props.isBold ? '700' : '300')};
    font-size: 16px;
    line-height: 18px;
    letter-spacing: ${(props) => (props.isBold ? '1px' : '11px')};
    padding-left: ${(props) => (props.isBold ? '0' : '5px')};
    text-transform: uppercase;
`;

export const HeaderRow = styled(FlexDivRow)`
    border-top: 1px solid ${(props) => props.theme.borderColor.primary};
    padding-top: 5px;
    justify-content: space-around;
    margin-bottom: 5px;
`;

export const LeaderboardRow = styled(FlexDivRow)`
    height: 36px;
    align-items: center;
    cursor: pointer;
    &.first {
        border-top: 2px solid ${(props) => props.theme.borderColor.primary};
        border-bottom: 2px solid ${(props) => props.theme.borderColor.primary};
    }
`;

export const Rank = styled(FlexDivCentered)`
    font-weight: 700;
    font-size: 12px;
    margin: 0px 5px;
    width: 15px;
`;

export const DataLabel = styled(FlexDivRowCentered)`
    font-weight: 400;
    font-size: 12px;
    line-height: 103.19%;
`;

export const ColumnLabel = styled.span`
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
    line-height: 103.19%;
    width: 100%;
`;

export const ColumnWrapper = styled(FlexDiv)<{ padding?: string }>`
    width: 32%;
    align-items: center;
    justify-content: center;
    text-align: center;
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    &:last-child {
        margin-right: 5px;
    }
`;

export const ArrowIcon = styled.i`
    font-size: 9px;
    display: flex;
    align-items: center;
    margin-right: 2px;
    margin-left: 4px;
`;

export const ExpandedRow = styled(FlexDivColumnCentered)``;

export const ParlayRow = styled(FlexDivRowCentered)`
    margin-top: 8px;
    &:last-child {
        margin-bottom: 10px;
    }
`;

export const QuoteText = styled.span`
    font-weight: 300;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    display: flex;
`;

export const ParlayRowMatch = styled(QuoteText)`
    max-width: 165px;
    padding-left: 7px;
`;

export const ParlayRowResult = styled(QuoteText)`
    padding-right: 7px;
`;

export const ParlayRowTeam = styled.span`
    white-space: nowrap;
    width: 165px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const OPLogoWrapper = styled(OPLogo)`
    width: 15px;
    height: 15px;
    margin-left: 5px;
`;

export const ArbitrumLogoWrapper = styled(ArbitrumLogo)`
    width: 17px;
    height: 17px;
    margin-left: 5px;
`;

export const ThalesLogoWrapper = styled(ThalesLogo)`
    width: 15px;
    height: 15px;
    margin-left: 5px;
`;

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 200px;
    width: 100%;
`;

export const NoResultContainer = styled(FlexDivCentered)`
    font-size: 12px;
    min-height: 50px;
    text-align: center;
`;

export const TagV2Container = styled.div`
    margin-top: -2px;
    margin-right: 2px;
`;

export const TagV2 = styled.span`
    color: ${(props) => props.theme.textColor.tertiary};
    background-color: #3fffff;
    font-size: 9px;
    font-weight: 600;
    line-height: 13px;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    border-radius: 5px;
    padding: 2px 2px;
    height: fit-content;
    cursor: pointer;
`;

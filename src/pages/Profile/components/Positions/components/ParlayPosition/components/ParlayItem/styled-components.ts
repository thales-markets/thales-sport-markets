import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 5px 10px;
`;

export const MatchInfo = styled(FlexDivRow)`
    justify-content: flex-start;
    align-items: center;
`;

export const MatchLogo = styled.div`
    display: flex;
    align-items: center;
    margin-right: 15px;
`;

export const ClubLogo = styled.img<{ awayTeam?: boolean; losingTeam?: boolean }>`
    height: 45px;
    width: 45px;
    opacity: ${(_props) => (_props?.losingTeam == true ? `0.4` : '1')};
    z-index: ${(_props) => (_props?.losingTeam == true ? '1' : '2')};
    ${(_props) => (_props?.awayTeam ? 'margin-left: -10px;' : '')}
`;

export const MatchLabel = styled(FlexDivRow)`
    margin-right: 5px;
`;

export const ClubName = styled.span`
    font-style: normal;
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-right: 5px;
`;

export const ParlayItemStatusContainer = styled(FlexDivRow)`
    width: 35%;
    align-items: center;
    justify-content: flex-start;
`;

export const ParlayStatus = styled.span`
    font-size: 12px;
    line-height: 110%;
    font-weight: 600;
    margin-left: 50px;
`;

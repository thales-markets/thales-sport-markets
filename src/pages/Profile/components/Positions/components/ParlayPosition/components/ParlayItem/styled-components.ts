import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 5px 10px;
    @media (max-width: 768px) {
        padding: 5px 5px;
    }
`;

export const MatchInfo = styled(FlexDivRow)`
    justify-content: flex-start;
    align-items: center;
    @media (max-width: 768px) {
        max-width: 50%;
    }
`;

export const MatchLogo = styled.div`
    display: flex;
    align-items: center;
    margin-right: 15px;
    @media (max-width: 768px) {
        margin-right: 7px;
    }
`;

export const ClubLogo = styled.img<{
    awayTeam?: boolean;
    losingTeam?: boolean;
    customMobileSize?: string;
    isFlag?: boolean;
}>`
    ${(props) => (props?.isFlag ? 'object-fit: cover;' : '')}
    ${(props) => (props?.isFlag ? 'border-radius: 50%;' : '')}
    height: 40px;
    width: 40px;
    opacity: ${(props) => (props?.losingTeam ? `0.4` : '1')};
    z-index: ${(props) => (props?.losingTeam ? '1' : '2')};
    ${(props) => (props?.awayTeam ? 'margin-left: -15px;' : '')}
    @media (max-width: 768px) {
        height: ${(props) => (props?.customMobileSize ? props.customMobileSize : '30px')};
        width: ${(props) => (props?.customMobileSize ? props.customMobileSize : '30px')};
    }
`;

export const MatchLabel = styled(FlexDivColumn)`
    margin-right: 5px;
    @media (max-width: 768px) {
        font-size: 10px;
        flex-direction: column;
        justify-content: center;
        word-wrap: unset;
    }
`;

export const ClubName = styled.span`
    font-style: normal;
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
    margin-right: 5px;
    word-wrap: normal;
    :last-child {
        margin-top: 5px;
    }
    @media (max-width: 768px) {
        font-size: 10px;
        :last-child {
            margin-top: 3px;
        }
    }
`;

export const StatusContainer = styled(FlexDivRow)`
    width: 50%;
    align-items: center;
    justify-content: flex-end;
`;

export const ParlayStatus = styled.span`
    font-size: 12px;
    line-height: 110%;
    font-weight: 600;
    margin-left: 50px;
    @media (max-width: 768px) {
        margin-left: 10px;
        min-width: 50px;
    }
`;

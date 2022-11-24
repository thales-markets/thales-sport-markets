import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

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
        max-width: 60%;
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
    height: 45px;
    width: 45px;
    opacity: ${(_props) => (_props?.losingTeam ? `0.4` : '1')};
    z-index: ${(_props) => (_props?.losingTeam ? '1' : '2')};
    ${(_props) => (_props?.awayTeam ? 'margin-left: -15px;' : '')}
    @media (max-width: 768px) {
        height: ${(_props) => (_props?.customMobileSize ? _props.customMobileSize : '30px')};
        width: ${(_props) => (_props?.customMobileSize ? _props.customMobileSize : '30px')};
    }
`;

export const MatchLabel = styled(FlexDivRow)`
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
    @media (max-width: 768px) {
        font-size: 10px;
        height: 15px;
        margin-top: 3px;
    }
`;

export const ParlayItemStatusContainer = styled(FlexDivRow)`
    width: 35%;
    align-items: center;
    justify-content: flex-start;
    @media (max-width: 768px) {
        width: 40%;
    }
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

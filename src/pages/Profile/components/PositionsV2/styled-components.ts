import styled, { CSSProperties } from 'styled-components';
import {
    FlexDivColumn,
    FlexDivColumnNative,
    FlexDivRow,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    min-width: 668px;
    @media (max-width: 768px) {
        min-width: auto;
    }
`;

export const CategoryContainer = styled(FlexDivSpaceBetween)`
    width: 100%;
    margin: 20px 0px;
    position: relative;
    color: ${(props) => props.theme.textColor.primary};
    align-items: center;
    cursor: pointer;
`;

export const CategoryInfo = styled(FlexDivStart)`
    align-items: center;
`;

export const CategoryLabel = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryIcon = styled.i`
    font-size: 20px;
    margin-right: 15px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const Arrow = styled.i`
    font-size: 14px;
    margin-right: 25px;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryDisclaimer = styled.div`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.status.loss};
    @media (max-width: 768px) {
        font-size: 11px;
        margin-left: 15px;
    }
`;

export const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: space-evenly;
    background: ${(props) => props.theme.background.secondary};
    border-radius: 7px;
    height: 200px;
    flex-direction: column;
`;

export const EmptyTitle = styled.span`
    font-weight: bold;
    color: ${(props) => props.theme.textColor.quaternary};
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 0.025em;
`;
export const EmptySubtitle = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 12px;
    width: 180px;
    letter-spacing: 0.025em;
`;

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

export const MatchInfo = styled.div`
    max-width: 300px;
    width: 300px;
    display: flex;
    align-items: center;
    height: 30px;
`;

export const MatchLogo = styled.div`
    display: flex;
    align-items: center;
    margin-right: 10px;
    @media (max-width: 768px) {
        margin-right: 7px;
    }
`;

export const ClubLogo = styled.img<{
    awayTeam?: boolean;
    losingTeam?: boolean;
    customMobileSize?: string;
}>`
    height: 24px;
    width: 24px;
    opacity: ${(props) => (props?.losingTeam ? `0.4` : '1')};
    z-index: ${(props) => (props?.losingTeam ? '1' : '2')};
    ${(props) => (props?.awayTeam ? 'margin-left: -15px;' : '')}
    @media (max-width: 768px) {
        height: ${(props) => (props?.customMobileSize ? props.customMobileSize : '30px')};
        width: ${(props) => (props?.customMobileSize ? props.customMobileSize : '30px')};
    }
`;

export const ClubName = styled.span<{
    isOneSided?: boolean;
}>`
    font-style: normal;
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 5px;
    margin-left: ${(props) => (props?.isOneSided ? `25px` : '')};
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

export const ClaimContainer = styled(FlexDivColumnNative)`
    min-width: 100px;
    align-items: end;
    justify-content: flex-end;
    @media (max-width: 768px) {
        min-width: 60px;
    }
    button {
        margin-top: 2px;
        @media (max-width: 768px) {
            margin-top: 0px;
        }
    }
`;

export const ClaimAllContainer = styled(FlexDivColumnNative)`
    min-width: 100px;
    align-items: end;
    justify-content: flex-end;
    margin-bottom: 10px;
    margin-right: 10px;

    @media (max-width: 768px) {
        min-width: 60px;
        margin-right: 5px;
    }
    button {
        margin-top: 2px;
        @media (max-width: 768px) {
            margin-top: 0px;
        }
    }
`;

export const ExternalLinkContainer = styled.div`
    height: 20px;
    width: 20px;
    display: block;
    cursor: pointer;
    margin-left: 20px;
    @media (max-width: 768px) {
        display: none;
    }
`;

export const ExternalLinkArrow = styled.i.attrs({ className: 'icon icon--arrow-external' })`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.primary};
    position: absolute;
    right: 15px;
    cursor: pointer;
`;

export const ExternalLink = styled.a``;

export const Label = styled.span<{ canceled?: boolean }>`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => (props?.canceled ? props.theme.status.canceled : props.theme.textColor.primary)};
    margin-right: 3px;
    @media (max-width: 768px) {
        font-size: 10px;
        margin-bottom: 2px;
    }
`;

export const ClaimLabel = styled(Label)`
    font-weight: 900;
    color: ${(props) => props.theme.textColor.quaternary};
    text-transform: uppercase;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const ClaimValue = styled(ClaimLabel)`
    text-transform: none;
`;

export const PayoutLabel = styled(ClaimLabel)`
    white-space: nowrap;
    @media (max-width: 768px) {
        margin-right: 0px;
        margin-bottom: 0px;
    }
`;

export const additionalClaimButtonStyle: CSSProperties = {
    minWidth: '100px',
    maxWidth: '100px',
};

export const additionalClaimButtonStyleMobile: CSSProperties = {
    minWidth: '65px',
    maxWidth: '80px',
};

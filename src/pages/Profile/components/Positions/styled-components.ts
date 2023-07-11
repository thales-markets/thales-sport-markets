import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    min-width: 668px;
    @media (max-width: 768px) {
        min-width: auto;
    }
`;

// --> Category Elements
export const CategoryContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: column;
    align-items: start;
    margin: 20px 0px;
    position: relative;
`;

export const CategoryLabel = styled.span`
    font-weight: 700;
    font-size: 14px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
    cursor: pointer;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryIcon = styled.i`
    font-size: 24px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-right: 20px;
    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const Arrow = styled.i`
    font-size: 18px;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 15px;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryDisclaimer = styled.div`
    padding-top: 5px;
    margin-left: 45px;
    font-size: 13px;
    @media (max-width: 768px) {
        font-size: 11px;
        margin-left: 15px;
    }
`;

//  ------------------------------------------------

export const EmptyContainer = styled(FlexDivRowCentered)`
    width: 100%;
    text-align: center;
    justify-content: space-evenly;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 4px;
    height: 200px;
    flex-direction: column;
`;

export const EmptyTitle = styled.span`
    font-family: 'Nunito';
    font-weight: bold;
    color: ${(props) => props.theme.textColor.quaternary};
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 0.025em;
`;
export const EmptySubtitle = styled.span`
    font-family: 'Nunito';
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 12px;
    width: 180px;
    letter-spacing: 0.025em;
`;

export const ListContainer = styled(FlexDivColumnNative)`
    width: 100%;
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
    font-weight: 400;
    font-size: 12px;
    color: ${(props) => (props?.canceled ? props.theme.status.canceled : props.theme.textColor.primary)};
    text-transform: uppercase;
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

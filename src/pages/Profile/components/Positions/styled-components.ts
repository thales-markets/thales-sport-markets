import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import Button from 'components/Button';

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
    color: ${MAIN_COLORS.TEXT.WHITE};
    text-transform: uppercase;
    cursor: pointer;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const CategoryIcon = styled.i`
    font-size: 24px;
    color: ${MAIN_COLORS.TEXT.DARK_GRAY};
    margin-right: 20px;
    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const Arrow = styled.i`
    font-size: 18px;
    color: ${MAIN_COLORS.TEXT.WHITE};
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
    color: #64d9fe;
    text-transform: uppercase;
    font-size: 16px;
    letter-spacing: 0.025em;
`;
export const EmptySubtitle = styled.span`
    font-family: 'Nunito';
    color: #64d9fe;
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
    color: ${MAIN_COLORS.TEXT.WHITE};
    position: absolute;
    right: 15px;
    cursor: pointer;
`;

export const ExternalLink = styled.a``;

export const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    padding: 1px 15px 1px 15px;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
    @media (max-width: 768px) {
        position: initial;
        font-size: 9px;
        padding: 2px 5px;
        min-height: 12px;
    }
`;

export const Label = styled.span<{ canceled?: boolean }>`
    font-weight: 400;
    font-size: 12px;
    color: ${(props) => (props?.canceled ? `${MAIN_COLORS.TEXT.CANCELED}` : `${MAIN_COLORS.TEXT.WHITE}`)};
    text-transform: uppercase;
    margin-right: 3px;
    @media (max-width: 768px) {
        font-size: 10px;
        margin-bottom: 2px;
    }
`;

export const ClaimLabel = styled(Label)`
    font-weight: 900;
    color: ${MAIN_COLORS.TEXT.BLUE};
    text-transform: uppercase;
    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

export const ClaimValue = styled(ClaimLabel)`
    text-transform: none;
`;

import { STATUS_COLOR } from 'constants/ui';
import styled from 'styled-components';

export const Container = styled.div<{
    backgroundColor?: string;
    claimBorder?: boolean;
    isCanceled?: boolean;
    isResolved?: boolean;
}>`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 10px 12px;
    border-radius: 5px;
    margin-bottom: 15px;
    cursor: pointer;
    /* background-color: ${(_props) => (_props?.backgroundColor ? _props.backgroundColor : '')}; */
    background-color: ${(_props) =>
        _props.isResolved && !_props.claimBorder ? 'rgb(36,41,64, 0.5)' : 'rgba(48, 54, 86, 0.5)'};
    border: ${(_props) => (_props?.claimBorder ? '3px solid #3FD1FF' : '')};
    ${(_props) => (_props.isCanceled ? `border: 3px solid ${STATUS_COLOR.CANCELED};` : '')}
`;

export const ClubNameLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 5px;
    width: 90px;
`;

export const ClubContainer = styled.div<{ away?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    ${(_props) => (_props?.away ? `justify-content: end;` : '')};
`;

export const ClubVsClubContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 33%;
`;

export const VSLabel = styled.span`
    margin: 0 10px;
    font-weight: 400;
    font-size: 12px;
`;

export const ClubLogo = styled.img<{ width?: string; height?: string }>`
    height: ${(_props) => (_props?.height ? _props.height : '30px')};
    width: ${(_props) => (_props?.width ? _props.width : '30px')};
`;

export const LinkIcon = styled.i`
    font-size: 16px;
    margin-left: 10px;
    margin-top: 7px;
    color: ${(props) => props.theme.textColor.secondary};
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

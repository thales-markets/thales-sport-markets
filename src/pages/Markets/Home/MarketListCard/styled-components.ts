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
    padding: 10px 23px;
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
    font-size: 15px;
    margin-left: 10px;
    width: 90px;
`;

export const ClubContainer = styled.div<{ away?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    ${(_props) => (_props?.away ? `justify-content: end;` : '')};
`;

export const BetTypeContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    font-weight: bold;
`;

export const ClubVsClubContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 35%;
`;

export const VSLabel = styled.span`
    margin: 0 20px;
    font-weight: 400;
    font-size: 15px;
`;

export const ClubLogo = styled.img<{ width?: string; height?: string }>`
    height: ${(_props) => (_props?.height ? _props.height : '40px')};
    width: ${(_props) => (_props?.width ? _props.width : '40px')};
`;

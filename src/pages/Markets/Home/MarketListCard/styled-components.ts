import styled from 'styled-components';

export const Container = styled.div<{ backgroundColor?: string }>`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 10px 23px;
    border-radius: 5px;
    background-color: ${(_props) => (_props?.backgroundColor ? _props.backgroundColor : '')};
`;

export const ClubNameLabel = styled.span`
    font-weight: 400;
    font-size: 15px;
    margin-left: 10px;
`;

export const ClubContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export const ClubVsClubContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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

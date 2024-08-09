import styled from 'styled-components';

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '10px 0',
    flexDirection: 'column',
    gap: '3px',
    height: '50px',
    marginLeft: '5px',
};

export const StickyRow = styled.div`
    margin-top: 5px;
    margin-left: 5px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    border-radius: 25px;
    background-color: ${(props) => props.theme.overdrop.textColor.primary};
    color: black;
`;

export const StickyContrainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;

export const StickyCell = styled.div<{ width?: string }>`
    width: ${(props) => props.width || '150px'};
    display: flex;
    text-align: center;
    justify-content: center;
    padding: 10px 0px;
    flex-direction: column;
    gap: 3px;
    height: 40px;
    font-size: 12px;
    font-weight: bold;
`;

export const Badge = styled.img`
    width: 55px;
    margin-left: -7px;
`;

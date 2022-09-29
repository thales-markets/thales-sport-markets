import styled from 'styled-components';

export const Container = styled.div<{ resolved?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${(_props) => (_props?.resolved ? 'center' : '')};
    margin-left: ${(_props) => (_props?.resolved ? '30px' : 'auto')};
    width: ${(_props) => (_props?.resolved ? '33%' : '40%')};
`;

export const WinnerLabel = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    line-height: 120%;
    color: #3fd1ff;
`;

export const OddsContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

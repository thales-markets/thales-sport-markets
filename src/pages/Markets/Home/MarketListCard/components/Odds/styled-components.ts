import styled from 'styled-components';

export const Container = styled.div<{ resolved?: boolean; isMobile?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${(_props) => (_props?.resolved ? 'center' : '')};
    margin-left: ${(_props) => (_props?.resolved ? '30px' : _props?.isMobile ? '' : 'auto')};
    // width: ${(_props) => (_props?.resolved ? '33%' : '40%')};
    height: ${(_props) => (_props?.isMobile ? '40px' : '')};
    flex-grow: ${(_props) => (_props?.isMobile ? '1' : '')};
`;

export const WinnerLabel = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    line-height: 120%;
    color: #3fd1ff;
    margin-left: 5px;
`;

export const OddsContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

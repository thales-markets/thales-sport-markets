import styled from 'styled-components';

export const Container = styled.div<{ isOnSelectedMarket?: boolean; isOpen: boolean }>`
    max-height: ${(props) => (props.isOnSelectedMarket ? '461px' : '475px')};
    min-height: 120px;
    overflow: hidden;
    padding: ${(props) =>
        !props.isOnSelectedMarket ? '20px 0px' : props.isOpen ? '20px 5px 120px 5px' : '20px 5px 20px 5px'};
`;

export const Title = styled.span`
    display: block;
    width: 100%;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

export const Arrow = styled.i`
    font-size: 14px;
    margin-left: 4px;
    text-transform: none;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

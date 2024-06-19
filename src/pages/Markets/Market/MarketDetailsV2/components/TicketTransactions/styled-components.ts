import styled from 'styled-components';

export const Container = styled.div<{ isOnSelectedMarket?: boolean; isOpen: boolean }>`
    display: flex;
    flex-direction: column;
    max-height: ${(props) => (props.isOnSelectedMarket ? '200vh' : '')};
    height: ${(props) => (props.isOnSelectedMarket && !props.isOpen ? '120px' : props.isOpen ? '200vh' : '')};
    overflow: hidden;
    margin: ${(props) =>
        !props.isOnSelectedMarket ? '20px 0px' : props.isOpen ? '20px 5px 72px 5px' : '20px 5px 20px 5px'};
    .MuiTablePagination-spacer {
        flex: ${(props) => (props.isOnSelectedMarket ? '0' : '1 1 100%')};
    }
`;

export const Title = styled.span`
    display: block;
    width: 100%;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 18px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

export const Arrow = styled.i`
    font-size: 14px;
    margin-left: 4px;
    text-transform: none;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
`;

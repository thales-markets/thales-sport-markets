import styled from 'styled-components';

export const Container = styled.div`
    max-height: 500px;
    overflow: hidden;
    padding: 20px 0px;
`;

export const Title = styled.span`
    display: block;
    width: 100%;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled.div<{ resolved?: boolean; isMobile?: boolean; noOdds?: boolean }>`
    display: flex;
    flex-direction: ${(props) => (props?.resolved && props?.isMobile ? 'column' : 'row')};
    align-items: center;
    justify-content: ${(props) => (props?.resolved ? 'center' : props?.noOdds ? 'space-evenly' : '')};
    margin-left: ${(props) => (props?.resolved && !props.isMobile ? '30px' : props?.isMobile ? '' : '10px')};
    height: ${(props) => (props?.isMobile ? '40px' : '')};
    flex-grow: 1;
    align-self: ${(props) => (props?.noOdds ? 'center' : '')};
`;

export const WinnerLabel = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    line-height: 120%;
    color: #3fd1ff;
    margin-left: 5px;
    @media (max-width: 950px) {
        margin-left: 0;
    }
`;

export const OddsContainer = styled.div<{ isMobile?: boolean; twoPositionalSport?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${(props) =>
        props?.isMobile ? 'space-around' : props?.twoPositionalSport ? 'flex-end' : 'space-between'};
    width: 100%;
    margin-top: ${(props) => (props?.isMobile ? '10px' : '')};
`;

export const WinnerContainer = styled(FlexDiv)``;

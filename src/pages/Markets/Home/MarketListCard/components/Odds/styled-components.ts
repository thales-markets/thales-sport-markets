import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Container = styled.div<{ resolved?: boolean; isMobile?: boolean; noOdds?: boolean }>`
    display: flex;
    flex-direction: ${(_props) => (_props?.resolved && _props?.isMobile ? 'column' : 'row')};
    align-items: center;
    justify-content: ${(_props) => (_props?.resolved ? 'center' : _props?.noOdds ? 'space-evenly' : '')};
    margin-left: ${(_props) => (_props?.resolved && !_props.isMobile ? '30px' : _props?.isMobile ? '' : 'auto')};
    height: ${(_props) => (_props?.isMobile ? '40px' : '')};
    flex-grow: ${(_props) => (_props?.isMobile ? '1' : '')};
    align-self: ${(_props) => (_props?.noOdds ? 'center' : '')};
`;

export const WinnerLabel = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    line-height: 120%;
    color: #3fd1ff;
    margin-left: 5px;
`;

export const OddsContainer = styled.div<{ isMobile?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: ${(_props) => (_props?.isMobile ? 'space-around' : 'space-between')};
    width: 100%;
    margin-top: ${(_props) => (_props?.isMobile ? '10px' : '')};
`;

export const WinnerContainer = styled(FlexDiv)``;

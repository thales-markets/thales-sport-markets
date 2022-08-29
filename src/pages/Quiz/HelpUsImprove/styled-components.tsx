import styled from 'styled-components';
import { FlexDivColumn, FlexDivStart } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    margin-bottom: 20px;
`;

export const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    :hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const Title = styled(FlexDivStart)`
    cursor: pointer;
    align-items: center;
    font-weight: 700;
    font-size: 19px;
`;

export const Icon = styled.i`
    font-size: 25px;
    margin-left: 6px;
    &:before {
        font-family: OvertimeIcons !important;
        content: '\\0052';
    }
`;

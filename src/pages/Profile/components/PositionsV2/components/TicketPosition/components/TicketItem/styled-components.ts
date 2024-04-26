import styled from 'styled-components';
import { FlexDivRowCentered } from '../../../../../../../../styles/common';

export const Wrapper = styled(FlexDivRowCentered)`
    margin-bottom: 10px;
    padding: 5px 10px;
    @media (max-width: 768px) {
        padding: 5px 5px;
    }
    & > div {
        flex: 1;
    }
`;

export const ParlayStatus = styled.span`
    font-size: 12px;
    line-height: 110%;
    font-weight: 600;
    margin-left: 50px;
    @media (max-width: 768px) {
        margin-left: 10px;
        min-width: 50px;
    }
`;

export const PlayerIcon = styled.i`
    font-size: 40px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-left: 24px;
`;

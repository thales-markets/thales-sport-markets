import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const TableText = styled.span<{ width?: string; marginLeft?: string }>`
    margin-left: ${(props) => props.marginLeft || '0px'};
    width: ${(props) => props.width || 'auto'};
    font-weight: 600;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    @media (max-width: 767px) {
        font-size: 11px;
        white-space: pre-wrap;
    }
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

export const ExpandedRowWrapper = styled.div`
    display: flex;
    flex-direction: column;
    border-bottom: 2px dashed ${(props) => props.theme.borderColor.senary};
`;

export const FirstExpandedSection = styled(FlexDivColumnCentered)`
    flex: 2;
    font-weight: 600;
    font-size: 11px;
    line-height: 11px;
    @media (max-width: 767px) {
        font-size: 10px;
    }
    @media (max-width: 575px) {
        font-size: 9px;
    }
`;

export const LastExpandedSection = styled(FlexDivRowCentered)`
    position: relative;
    justify-content: center;
    width: 100%;
    align-items: center;
    margin-bottom: 10px;
`;

export const VolumeWrapper = styled(FlexDivRow)`
    width: 200px;
    margin: 0 20px;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quaternary};
    @media (max-width: 767px) {
        margin: 0 10px;
        font-size: 9px;
    }
`;

export const VolumeText = styled.span`
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
`;

export const VolumeValue = styled.span`
    font-weight: 400;
    text-transform: uppercase;
`;

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
};

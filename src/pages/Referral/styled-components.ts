import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumnNative)`
    font-size: 14px;
    font-weight: 400;
    width: 700px;
    align-items: flex-start;
    margin-top: 20px;
    @media (max-width: 768px) {
        width: 100%;
        min-width: auto;
    }
`;

export const MainInfoContainer = styled(FlexDivRow)`
    width: 100%;
    align-items: flex-start;
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const ButtonContainer = styled(FlexDivColumnNative)`
    width: 50%;
    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const GenerateLink = styled.button`
    background-color: ${MAIN_COLORS.LIGHT_BLUE};
    width: 100%;
    padding: 10px 0px;
    text-align: center;
    border: none;
    margin-bottom: 15px;
    border-radius: 5px;
    font-weight: 700;
`;

export const CopyLink = styled.button`
    position: relative;
    border: 1px solid ${MAIN_COLORS.LIGHT_BLUE};
    color: ${MAIN_COLORS.LIGHT_BLUE};
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    text-align: center;
    width: 100%;
    border-radius: 5px;
    padding: 10px 0px;
    font-weight: 700;
`;

export const InfoContainer = styled(FlexDivColumnNative)`
    border: 1.5px solid ${MAIN_COLORS.LIGHT_BLUE};
    border-radius: 12px;
    padding: 15px;
    margin-left: 15px;
    justify-content: space-between;
    width: 50%;
    @media (max-width: 768px) {
        margin-left: 0px;
        margin-top: 10px;
        width: 100%;
    }
`;

export const KeyValueContainer = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 6px;
`;

export const Label = styled.span<{ win?: boolean }>`
    text-transform: uppercase;
    color: ${(props) => (props?.win ? `${MAIN_COLORS.TEXT.POTENTIAL_PROFIT}` : `${MAIN_COLORS.LIGHT_BLUE}`)};
    ::after {
        content: ': ';
    }
`;

export const Value = styled.span<{ win?: boolean }>`
    font-weight: 800;
    color: ${(props) => (props?.win ? `${MAIN_COLORS.TEXT.POTENTIAL_PROFIT}` : `${MAIN_COLORS.TEXT.WHITE}`)};
`;

export const ParagraphContainer = styled(FlexDivColumnNative)`
    margin-top: 15px;
`;

export const ParagraphHeader = styled.h1`
    font-size: 20px;
    font-weight: 600;
    line-height: 120%;
    margin-bottom: 12px;
`;

export const Paragraph = styled.p`
    font-size: 12px;
    line-height: 150%;
    color: ${MAIN_COLORS.TEXT.WHITE};
`;

export const TabsContainer = styled(FlexDivRow)`
    border-bottom: 2px solid ${MAIN_COLORS.LIGHT_GRAY};
    justify-content: space-around;
    width: 100%;
    margin-top: 20px;
    @media (max-width: 768px) {
        justify-content: center;
    }
`;

export const Tab = styled.span<{ active?: boolean }>`
    text-transform: uppercase;
    color: ${(props) => (props?.active ? `${MAIN_COLORS.LIGHT_BLUE}` : `${MAIN_COLORS.LIGHT_GRAY}`)};
    padding-bottom: 5px;
    cursor: pointer;
    font-weight: 600;
    @media (max-width: 768px) {
        font-size: 10px;
        text-align: center;
    }
`;

export const TableContainer = styled.div`
    width: 100%;
    margin-top: 10px;
    min-height: 400px;
`;

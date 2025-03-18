import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    align-items: center;
    padding: 30px 40px 30px 40px;
    @media (max-width: 950px) {
        width: auto;
        height: auto;
    }
`;

export const Title = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 27px;
    font-weight: 600;
    line-height: 32px;
    letter-spacing: 0.025em;
    text-align: center;
    @media (max-width: 575px) {
        font-size: 18px;
        margin-top: 0px;
    }
`;

export const MarketDataContainer = styled(FlexDivColumn)`
    align-items: start;
`;

const Text = styled.span`
    font-size: 13px;
    font-weight: 500;
    line-height: 13px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 5px;
    @media (max-width: 575px) {
        font-size: 12px;
        margin-top: 5px;
    }
`;

export const Label = styled(Text)`
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 15px;
`;

export const Value = styled(Text)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const InputContainer = styled.div`
    position: relative;
    width: 300px;
    margin-top: 20px;
    @media (max-width: 575px) {
        margin-top: 10px;
    }
`;

export const ButtonContainer = styled(FlexDivSpaceBetween)<{ isCancel: boolean }>`
    gap: 10px;
    width: 100%;
    justify-content: ${(props) => (props.isCancel ? 'space-between' : 'center')};
`;

export const defaultCustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-48%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        overflow: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 202,
    },
};

export const CloseIcon = styled.i`
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 16px 18px;
    cursor: pointer;
    @media (max-width: 950px) {
        right: 0px;
        top: 0px;
        font-size: 18px;
        padding: 12px 10px 15px 15px;
    }
`;

export const defaultButtonProps = {
    width: '300px',
    margin: '10px 0 0 0',
};

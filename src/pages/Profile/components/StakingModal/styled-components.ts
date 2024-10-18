import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    width: 800px;
    height: 500px;
    background-image: url(stake-modal-image.png);
    border-radius: 7px;
    align-items: center;
    padding: 30px 10px 20px 10px;
    @media (max-width: 950px) {
        width: auto;
        height: auto;
    }
`;

export const Title = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 27px;
    font-weight: 600;
    line-height: 30px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 5px;
    @media (max-width: 575px) {
        font-size: 18px;
        margin-top: 0px;
    }
`;

export const Description = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 500;
    line-height: 13px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 10px;
    @media (max-width: 575px) {
        font-size: 12px;
        margin-top: 5px;
    }
`;

export const InputContainer = styled.div`
    position: relative;
    width: 300px;
    margin-top: 70px;
    @media (max-width: 575px) {
        margin-top: 50px;
    }
`;

export const CongratulationsTitle = styled(Title)`
    color: ${(props) => props.theme.success.textColor.primary};
`;

export const ButtonContainer = styled(FlexDivCentered)`
    margin-bottom: 100px;
    @media (max-width: 575px) {
        margin-bottom: 50px;
    }
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
    padding: 8px 10px;
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

export const StakingPageLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

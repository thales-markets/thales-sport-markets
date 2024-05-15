import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import Scroll from '../../../../../../components/Scroll';
import Parlay from '../../ParlayV2';

type ParylayMobileModalProps = {
    onClose: () => void;
};

const ParylayMobileModal: React.FC<ParylayMobileModalProps> = ({ onClose }) => {
    console.log('load modal');
    return (
        <Container>
            <Header>
                <Title>Ticket</Title>
            </Header>
            <CloseIcon className="icon icon--close" onClick={onClose} />
            <Scroll height="100vh">
                <Parlay />
            </Scroll>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    background: ${(props) => props.theme.background.quinary};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 2;
`;

const Header = styled(FlexDivRow)`
    min-height: 50px;
    justify-content: center;
`;

const Title = styled(FlexDivCentered)`
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    padding: 5px 15px;
    text-transform: uppercase;
    border-radius: 20px;
    height: 30px;
    margin-top: 10px;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
`;

const CloseIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    cursor: pointer;
    right: 0px;
    top: 0px;
    font-size: 18px;
    padding: 16px;
`;

export default ParylayMobileModal;

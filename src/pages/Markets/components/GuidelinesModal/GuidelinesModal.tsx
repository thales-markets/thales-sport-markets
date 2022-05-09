import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import Modal from 'components/Modal';
import Guidelines from 'pages/Markets/CreateMarket/Guidelines';

type GuidelinesModalProps = {
    onClose: () => void;
};

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <Modal title={t('market.dispute.open-dispute-modal-title')} onClose={onClose}>
            <Container>
                <Guidelines />
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    color: ${(props) => props.theme.textColor.primary};
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    text-align: justify;
    ul {
        list-style: initial;
        margin-left: 15px;
    }
    li {
        :not(:last-child) {
            margin-bottom: 10px;
        }
    }
    max-width: 700px;
`;

export default GuidelinesModal;

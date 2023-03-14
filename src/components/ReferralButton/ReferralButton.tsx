import RefferalModal from 'components/RefferalModal';
import Tooltip from 'components/Tooltip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

const ReferralButton: React.FC = () => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const getButtonComponent = () => (
        <StyledButton onClick={() => setIsModalOpen(true)} customDisabled={!isWalletConnected}>
            {t('common.referral.button.label')}
        </StyledButton>
    );

    return (
        <Container>
            {isModalOpen && <RefferalModal onClose={() => setIsModalOpen(false)} />}
            <Tooltip
                overlay={
                    <>
                        {isWalletConnected
                            ? t('common.referral.button.enabled-tooltip')
                            : t('common.referral.button.disbled-tooltip')}
                    </>
                }
                component={getButtonComponent()}
                iconFontSize={23}
                marginLeft={2}
                top={0}
            />
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 28px;
    button {
        padding: 0 20px;
        width: 100%;
    }
`;

const StyledButton = styled.button<{ customDisabled?: boolean }>`
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 5px;
    padding: 1px 20px 0px 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    text-align: center;
    outline: none;
    text-transform: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    opacity: ${(props) => (props.customDisabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.customDisabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.customDisabled ? '0.4' : '0.8')};
    }
`;

export default ReferralButton;

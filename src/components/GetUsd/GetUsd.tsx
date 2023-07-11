import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { FlexDivCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';
import SwapModal from 'components/SwapModal';
import { isMobile } from 'utils/device';
import { ThemeInterface } from 'types/ui';

const GetUsd: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [openSwapModal, setOpenSwapModal] = useState<boolean>(false);

    return (
        <>
            {isWalletConnected && (
                <Container>
                    <Button
                        onClick={() => setOpenSwapModal(true)}
                        backgroundColor={theme.button.background.tertiary}
                        textColor={theme.button.textColor.quaternary}
                        borderColor={theme.button.borderColor.secondary}
                        fontWeight="400"
                        fontSize="12.5px"
                        height="24px"
                    >
                        {t('common.swap.title')}
                    </Button>
                    {openSwapModal && <SwapModal onClose={() => setOpenSwapModal(false)} />}
                </Container>
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    margin-bottom: 20px;
    height: ${isMobile() ? '28px' : '24px'};
    button {
        padding: 0 20px;
        width: 100%;
    }
    @media (max-width: 500px) {
        width: 100%;
        button {
            width: 100%;
        }
    }
`;

export default GetUsd;

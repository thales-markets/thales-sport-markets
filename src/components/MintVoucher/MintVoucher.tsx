import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { FlexDivCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';
import MintVoucherModal from 'components/MintVoucherModal';

type MintVoucherProps = {
    style?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
};

const MintVoucher: React.FC<MintVoucherProps> = ({ style, buttonStyle }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [openMintVoucherModal, setOpenMintVoucherModal] = useState<boolean>(false);

    return (
        <>
            {isWalletConnected && (
                <Container style={style}>
                    <Button
                        style={buttonStyle}
                        type="primary"
                        onClick={() => setOpenMintVoucherModal(true)}
                        fontSize={12.5}
                    >
                        {t('common.voucher.mint-voucher')}
                    </Button>
                    {openMintVoucherModal && <MintVoucherModal onClose={() => setOpenMintVoucherModal(false)} />}
                </Container>
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 28px;
    button {
        padding: 0 20px;
    }
    @media (max-width: 500px) {
        width: 100%;
        button {
            width: 100%;
        }
    }
`;

export default MintVoucher;

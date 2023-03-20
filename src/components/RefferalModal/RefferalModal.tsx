import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'components/Modal';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered, FlexDivCentered } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getWalletAddress } from 'redux/modules/wallet';
import { toast } from 'react-toastify';
import networkConnector from 'utils/networkConnector';
import { generalConfig } from 'config/general';
import { buildReffererLink } from 'utils/routes';
import { useTranslation } from 'react-i18next';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';

type RefferalModalProps = {
    onClose: () => void;
};

export const RefferalModal: React.FC<RefferalModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [reffererID, setReffererID] = useState('');
    const [savedReffererID, setSavedReffererID] = useState('');
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '', { enabled: !!walletAddress });

    useEffect(() => {
        if (reffererIDQuery.isSuccess && reffererIDQuery.data) {
            setReffererID(reffererIDQuery.data);
            setSavedReffererID(reffererIDQuery.data);
        }
    }, [reffererIDQuery.isSuccess, reffererIDQuery.data]);

    const onSubmit = useCallback(async () => {
        const signature = await (networkConnector as any).signer.signMessage(reffererID);
        const response = await axios.post(`${generalConfig.API_URL}/update-refferer-id`, {
            walletAddress,
            reffererID,
            signature,
            previousReffererID: savedReffererID,
        });
        if (response.data.error) {
            toast(t('common.referral.id-exists'), { type: 'error' });
        } else {
            setSavedReffererID(reffererID);
            toast(t('common.referral.id-create-success'), { type: 'success' });
        }
    }, [reffererID, walletAddress, savedReffererID, t]);

    const referralClickHandler = () => {
        if (!walletAddress) {
            return;
        }

        const referralLink = buildReffererLink(savedReffererID);

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    return (
        <Modal
            customStyle={{ content: { maxWidth: '100%' } }}
            title={t('common.referral.modal.title')}
            onClose={onClose}
        >
            <Container>
                <Description>{t('common.referral.modal.description')}</Description>
                <FlexDivRowCentered>
                    <StyledInput value={reffererID} onChange={(e) => setReffererID(e.target.value)} />
                    <SubmitButton disabled={!reffererID || savedReffererID === reffererID} onClick={onSubmit}>
                        {t('common.referral.modal.submit-button')}
                    </SubmitButton>
                </FlexDivRowCentered>
                <FlexDivCentered style={{ marginTop: '30px' }}>
                    <CopyToClipboardButton
                        onClick={referralClickHandler}
                        disabled={!savedReffererID}
                        customDisabled={!savedReffererID}
                    >
                        {t('common.referral.modal.copy-button')}
                    </CopyToClipboardButton>
                </FlexDivCentered>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 30px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const Description = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
    p {
        margin-bottom: 10px;
    }
    a {
        cursor: pointer;
        color: #91bced;
        &:hover {
            color: #00f9ff;
        }
    }
`;

const StyledInput = styled.input`
    background: #ffffff;
    border-radius: 5px;
    border: 2px solid #1a1c2b;
    color: #1a1c2b;
    width: 300px;
    height: 34px;
    padding-left: 10px;
    padding-right: 60px;
    font-size: 18px;
    outline: none;
    @media (max-width: 575px) {
        width: 250px;
    }
`;

const SubmitButton = styled.button`
    background: linear-gradient(88.84deg, #2fc9dd 19.98%, #1ca6b9 117.56%);
    border-radius: 8px;
    margin: 0 20px;
    font-size: 20px;
    font-weight: 700;
    line-height: 23px;
    color: #1a1c2b;
    width: 252px;
    border: none;
    padding: 5px;
    cursor: pointer;
    text-transform: uppercase;
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const CopyToClipboardButton = styled.button<{ customDisabled?: boolean }>`
    background: ${(props) => props.theme.button.background.tertiary};
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

export default RefferalModal;

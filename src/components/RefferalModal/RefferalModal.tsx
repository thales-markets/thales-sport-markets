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
import TextInput from 'components/fields/TextInput';
import Button from 'components/Button';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

type RefferalModalProps = {
    onClose: () => void;
};

const RefferalModal: React.FC<RefferalModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
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
                    <TextInput value={reffererID} onChange={(e: any) => setReffererID(e.target.value)} margin="0" />
                    <Button
                        disabled={!reffererID || savedReffererID === reffererID}
                        height="30px"
                        margin="0 0 0 10px"
                        backgroundColor={theme.button.background.quaternary}
                        borderColor={theme.button.borderColor.secondary}
                        onClick={onSubmit}
                    >
                        {t('common.referral.modal.submit-button')}
                    </Button>
                </FlexDivRowCentered>
                <FlexDivCentered>
                    <Button onClick={referralClickHandler} margin="30px 0 0 0" disabled={!savedReffererID}>
                        {t('common.referral.modal.copy-button')}
                    </Button>
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
        color: ${(props) => props.theme.link.textColor.primary};
        :hover {
            text-decoration: underline;
        }
    }
`;

export default RefferalModal;

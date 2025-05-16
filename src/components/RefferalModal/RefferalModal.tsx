import axios from 'axios';
import Button from 'components/Button';
import TextInput from 'components/fields/TextInput';
import Modal from 'components/Modal';
import { generalConfig } from 'config/general';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { buildReffererLink } from 'utils/routes';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useSignMessage } from 'wagmi';

type RefferalModalProps = {
    onClose: () => void;
};

const RefferalModal: React.FC<RefferalModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const [reffererID, setReffererID] = useState('');
    const [savedReffererID, setSavedReffererID] = useState('');

    const { signMessageAsync } = useSignMessage();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '', { enabled: !!walletAddress });

    useEffect(() => {
        if (reffererIDQuery.isSuccess && reffererIDQuery.data) {
            setReffererID(reffererIDQuery.data);
            setSavedReffererID(reffererIDQuery.data);
        }
    }, [reffererIDQuery.isSuccess, reffererIDQuery.data]);

    const onSubmit = useCallback(async () => {
        const signature = await signMessageAsync({ message: reffererID });
        const response = await axios.post(`${generalConfig.API_URL}/update-refferer-id`, {
            walletAddress,
            reffererID,
            signature,
            previousReffererID: savedReffererID,
        });
        if (response.data.error) {
            toast(t('common.referral.id-exists'), { type: 'error' });
        } else {
            PLAUSIBLE.trackEvent(PLAUSIBLE_KEYS.submitReferralId);
            setSavedReffererID(reffererID);
            toast(t('common.referral.id-create-success'), { type: 'success' });
        }
    }, [reffererID, walletAddress, savedReffererID, t, signMessageAsync]);

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

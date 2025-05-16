import Button from 'components/Button';
import RefferalModal from 'components/RefferalModal';
import Tooltip from 'components/Tooltip';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn } from 'styles/common';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { buildReffererLink } from 'utils/routes';
import useBiconomy from 'utils/useBiconomy';
import { useAccount } from 'wagmi';

const ReferralButton: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address, isConnected: isWalletConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '');
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

    const getButtonComponent = () => (
        <Button
            onClick={() => setIsModalOpen(true)}
            backgroundColor={theme.button.background.tertiary}
            textColor={theme.button.textColor.quaternary}
            borderColor={theme.button.borderColor.secondary}
            fontWeight="400"
            fontSize="12.5px"
            disabled={!isWalletConnected}
        >
            {t('common.referral.button.label')}
        </Button>
    );

    const referralClickHandler = () => {
        if (!walletAddress) {
            return;
        }

        const referralLink = buildReffererLink(String(reffererID));

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    return (
        <Container>
            {isModalOpen && <RefferalModal onClose={() => setIsModalOpen(false)} />}
            <ButtonContainer>
                <Tooltip
                    overlay={
                        <>
                            {isWalletConnected
                                ? t('common.referral.button.enabled-tooltip')
                                : t('common.referral.button.disbled-tooltip')}
                        </>
                    }
                    iconFontSize={23}
                    marginLeft={2}
                    top={0}
                >
                    {getButtonComponent()}
                </Tooltip>
                {reffererID && (
                    <CopyContainer>
                        <span>{t('common.referral.your-referral-id')}:</span>
                        <span>{String(reffererID)} </span>
                        <CopyIcon onClick={referralClickHandler} className={`icon icon--copy`} />
                    </CopyContainer>
                )}
            </ButtonContainer>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 92px;
    button {
        padding: 0 20px;
        width: 100%;
    }
`;

const ButtonContainer = styled(FlexDivColumn)`
    height: 100%;
`;

const CopyContainer = styled(FlexDiv)`
    font-size: 17px;
    height: 100%;
    align-items: center;
    justify-content: center;
    & > span {
        margin-right: 5px;
    }
`;

const CopyIcon = styled.i`
    color: ${(props) => props.theme.button.borderColor.secondary};
    cursor: pointer;
`;

export default ReferralButton;

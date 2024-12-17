import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import networkConnector from 'utils/networkConnector';
import { refetchResolveBlocker } from '../../../utils/queryConnector';

type UnblockActionProps = {
    gameId: string;
    isWitelistedForUnblock: boolean;
};

const UnblockAction: FC<UnblockActionProps> = memo(({ gameId, isWitelistedForUnblock }) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();
    const theme: ThemeInterface = useTheme();
    const networkId = useSelector(getNetworkId);
    const isWalletConnected = useSelector(getIsWalletConnected);
    const [isUnblocking, setIsUnblocking] = useState<boolean>(false);

    const getButton = (text: string, onClick: any, disabled: boolean) => (
        <Button
            onClick={onClick}
            backgroundColor={theme.button.background.quaternary}
            borderColor={theme.button.borderColor.secondary}
            height="20px"
            fontSize="11px"
            padding="2px 20px"
            fontWeight="800"
            disabled={disabled}
        >
            {text}
        </Button>
    );

    const handleUnblock = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        const { resolveBlockerContract, signer } = networkConnector;

        if (resolveBlockerContract && signer) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsUnblocking(true);

                const resolveBlockerContractWithSigner = resolveBlockerContract.connect(signer);
                const tx = await resolveBlockerContractWithSigner.unblockGames([gameId]);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(toastId, getSuccessToastOptions(t('resolve-blocker.unblock-confirmation-message')));
                    setIsUnblocking(false);
                    refetchResolveBlocker(networkId);
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsUnblocking(false);
            }
        }
    };

    const getActionButton = () => {
        if (!isWalletConnected) {
            return getButton(t('common.wallet.connect-your-wallet'), openConnectModal, false);
        }
        if (!isWitelistedForUnblock) {
            return (
                <>
                    {getButton(t('resolve-blocker.unblock'), undefined, true)}
                    <Tooltip
                        overlay={t('resolve-blocker.not-whitelisted-for-unblock-tooltip')}
                        marginLeft={2}
                        iconFontSize={16}
                    ></Tooltip>
                </>
            );
        }
        return getButton(
            t(isUnblocking ? 'resolve-blocker.unblocking' : 'resolve-blocker.unblock'),
            handleUnblock,
            isUnblocking
        );
    };

    return <>{getActionButton()}</>;
});

export default UnblockAction;

import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import TextInput from 'components/fields/TextInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { ResolveType } from 'enums/resultManagement';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import { useTheme } from 'styled-components';
import { TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getContractInstance } from 'utils/contract';
import { getTitleText } from 'utils/marketsV2';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import {
    ButtonContainer,
    CloseIcon,
    Container,
    defaultButtonProps,
    defaultCustomStyles,
    InputContainer,
    Label,
    MarketDataContainer,
    Title,
    Value,
} from './styled-components';

type StakingModalProps = {
    ticketMarket: TicketMarket;
    onClose: () => void;
};

const ResolveModal: React.FC<StakingModalProps> = ({ ticketMarket: market, onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const { openConnectModal } = useConnectModal();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected } = useAccount();

    const [result, setResult] = useState<string>('');
    const [isResolving, setIsResolving] = useState<boolean>(false);

    const isSetResultButtonDisabled = result.trim() === '' || isResolving;

    const handleResolve = async (resolveType: ResolveType) => {
        const resultManagerContract = getContractInstance(ContractType.SPORTS_AMM_V2_RESULT_MANAGER, {
            client: walletClient.data,
            networkId,
        });

        if (resultManagerContract) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsResolving(true);

                const txHash =
                    resolveType === ResolveType.CANCEL_MARKET
                        ? await resultManagerContract?.write?.cancelMarkets([
                              [market.gameId],
                              [market.typeId],
                              [market.playerProps.playerId],
                              [market.line * 100],
                          ])
                        : resolveType === ResolveType.CANCEL_ALL_MARKET_LINES
                        ? await resultManagerContract?.write?.cancelMarkets([
                              [market.gameId],
                              [market.typeId],
                              [market.playerProps.playerId],
                              [0],
                          ])
                        : resolveType === ResolveType.CANCEL_GAME
                        ? await resultManagerContract?.write?.cancelGame([market.gameId])
                        : await resultManagerContract?.write?.setResultsPerMarkets([
                              [market.gameId],
                              [market.typeId],
                              [market.playerProps.playerId],
                              [[result]],
                          ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
                    toast.update(
                        toastId,
                        getSuccessToastOptions(
                            t(
                                resolveType === ResolveType.SET_RESULT
                                    ? 'markets.resolve-modal.result-set-confirmation-message'
                                    : 'markets.resolve-modal.cancel-confirmation-message'
                            )
                        )
                    );
                    setResult('');
                    onClose();
                    setIsResolving(false);
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsResolving(false);
            }
        }
    };

    const getButton = (text: string, isDisabled: boolean, resolveType: ResolveType) => {
        return (
            <Button
                backgroundColor={resolveType !== ResolveType.SET_RESULT ? theme.button.textColor.tertiary : undefined}
                borderColor={resolveType !== ResolveType.SET_RESULT ? theme.button.textColor.tertiary : undefined}
                height="24px"
                margin="20px 0px 5px 0px"
                padding="2px 10px"
                width="fit-content"
                fontSize="14px"
                lineHeight="16px"
                onClick={async () => handleResolve(resolveType)}
                disabled={isDisabled}
            >
                {text}
            </Button>
        );
    };

    const getCancelButtons = () => {
        if (!isConnected) {
            return (
                <Button onClick={openConnectModal} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        return (
            <>
                <Tooltip overlay={t('markets.resolve-modal.button.cancel-market-tooltip')}>
                    {getButton(
                        t('markets.resolve-modal.button.cancel-market-label'),
                        isResolving,
                        ResolveType.CANCEL_MARKET
                    )}
                </Tooltip>
                <Tooltip overlay={t('markets.resolve-modal.button.cancel-all-market-lines-tooltip')}>
                    {getButton(
                        t('markets.resolve-modal.button.cancel-all-market-lines-label'),
                        isResolving,
                        ResolveType.CANCEL_ALL_MARKET_LINES
                    )}
                </Tooltip>
                <Tooltip overlay={t('markets.resolve-modal.button.cancel-game-tooltip')}>
                    {getButton(
                        t('markets.resolve-modal.button.cancel-game-label'),
                        isResolving,
                        ResolveType.CANCEL_GAME
                    )}
                </Tooltip>
            </>
        );
    };

    const getSetResultButton = () => {
        if (!isConnected) {
            return (
                <Button onClick={openConnectModal} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        return (
            <>
                {getButton(
                    t('markets.resolve-modal.button.set-result-label'),
                    isSetResultButtonDisabled,
                    ResolveType.SET_RESULT
                )}
            </>
        );
    };

    return (
        <ReactModal
            isOpen
            onRequestClose={() => onClose()}
            shouldCloseOnOverlayClick={true}
            style={defaultCustomStyles}
        >
            <Container>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
                <Title>{t('markets.resolve-modal.title')}</Title>
                <MarketDataContainer>
                    <Label>{t('markets.resolve-modal.game')}:</Label>
                    <Value>{market.gameId}</Value>
                    <Value>{`${market.homeTeam} - ${market.awayTeam}`}</Value>
                    <Label>{t('markets.resolve-modal.type')}:</Label>
                    <Value>{`${market.typeId} (${getTitleText(market)})`}</Value>
                    <Label>{t('markets.resolve-modal.player')}:</Label>
                    <Value>{`${market.playerProps.playerId}${
                        market.isPlayerPropsMarket ? ` (${market.playerProps.playerName})` : ''
                    }`}</Value>
                    <Label>{t('markets.resolve-modal.line')}:</Label>
                    <Value>{market.line}</Value>
                </MarketDataContainer>
                <ButtonContainer isCancel={true}>{getCancelButtons()}</ButtonContainer>
                <Label>OR</Label>
                <InputContainer>
                    <TextInput
                        value={result}
                        onChange={(event: any) => setResult(event.target.value)}
                        disabled={isResolving}
                        label={t('markets.resolve-modal.set-result-label')}
                        tooltip={t('markets.resolve-modal.set-result-tooltip')}
                        placeholder={t('markets.resolve-modal.set-result-placeholder')}
                        inputPadding="5px 10px"
                    />
                </InputContainer>
                <ButtonContainer isCancel={false}>{getSetResultButton()}</ButtonContainer>
            </Container>
        </ReactModal>
    );
};

export default ResolveModal;

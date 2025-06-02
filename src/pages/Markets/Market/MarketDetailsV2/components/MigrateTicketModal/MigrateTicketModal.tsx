import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import SimpleLoader from 'components/SimpleLoader';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import useLiquidityPoolTicketDataQuery from 'queries/liquidityPool/useLiquidityPoolTicketDataQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import { useTheme } from 'styled-components';
import { Ticket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import {
    ButtonContainer,
    CloseIcon,
    Container,
    defaultButtonProps,
    defaultCustomStyles,
    Description,
    InputContainer,
    Label,
    LoaderContainer,
    MarketDataContainer,
    NotFoundValidation,
    Title,
    Value,
} from './styled-components';

type MigrateTicketModalProps = {
    ticket: Ticket;
    onClose: () => void;
};

const MigrateTicketModal: React.FC<MigrateTicketModalProps> = ({ ticket, onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const { openConnectModal } = useConnectModal();

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected } = useAccount();

    const [newRound, setNewRound] = useState<number | string>(0);
    const [ticketIndexInRound, setTicketIndexInRound] = useState<number | string>(0);
    const [isMigrating, setIsMigrating] = useState<boolean>(false);

    const liquidityPoolTicketDataQuery = useLiquidityPoolTicketDataQuery(ticket.id, ticket.collateral, {
        networkId,
        client,
    });
    const liquidityPoolTicketData = useMemo(
        () =>
            liquidityPoolTicketDataQuery.isSuccess && liquidityPoolTicketDataQuery.data
                ? liquidityPoolTicketDataQuery.data
                : undefined,
        [liquidityPoolTicketDataQuery.data, liquidityPoolTicketDataQuery.isSuccess]
    );

    const isMigrateTicketButtonDisabled =
        newRound.toString().trim() === '' ||
        ticketIndexInRound.toString().trim() === '' ||
        isMigrating ||
        !liquidityPoolTicketData?.foundInRound;

    useEffect(() => {
        setTicketIndexInRound(
            liquidityPoolTicketData && liquidityPoolTicketData.foundInRound ? liquidityPoolTicketData.indexInRound : 0
        );
    }, [liquidityPoolTicketData]);

    const handleMigrateTicket = async () => {
        const liquidityPoolContractWithSigner = getContractInstance(
            ContractType.LIQUIDITY_POOL,
            { client: walletClient.data, networkId },
            undefined,
            ticket.collateral.toLowerCase() as LiquidityPoolCollateral
        ) as ViemContract;

        if (liquidityPoolContractWithSigner) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsMigrating(true);

                const txHash = await liquidityPoolContractWithSigner.write.migrateTicketToAnotherRound([
                    ticket.id,
                    Number(newRound),
                    Number(ticketIndexInRound),
                ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
                    toast.update(
                        toastId,
                        getSuccessToastOptions(t('markets.migrate-ticket-modal.migrate-ticket-confirmation-message'))
                    );
                    setNewRound(0);
                    setTicketIndexInRound(0);
                    onClose();
                    setIsMigrating(false);
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsMigrating(false);
            }
        }
    };

    const getButton = (text: string, isDisabled: boolean) => {
        return (
            <Button
                backgroundColor={theme.button.textColor.tertiary}
                borderColor={theme.button.textColor.tertiary}
                height="24px"
                margin="20px 0px 5px 0px"
                padding="2px 10px"
                width="fit-content"
                fontSize="14px"
                lineHeight="16px"
                onClick={async () => handleMigrateTicket()}
                disabled={isDisabled}
            >
                {text}
            </Button>
        );
    };

    const getMigrateTicketButton = () => {
        if (!isConnected) {
            return (
                <Button onClick={openConnectModal} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        return <>{getButton(t('markets.migrate-ticket-modal.migrate-ticket-label'), isMigrateTicketButtonDisabled)}</>;
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
                <Title>{t('markets.migrate-ticket-modal.title')}</Title>
                <Description>
                    <Trans i18nKey="markets.migrate-ticket-modal.description" />
                </Description>
                <MarketDataContainer>
                    <Label>{t('markets.migrate-ticket-modal.ticket-id')}:</Label>
                    <Value>{ticket.id}</Value>
                    <Label>{t('markets.migrate-ticket-modal.lp')}:</Label>
                    <Value>{ticket.collateral}</Value>
                    <Label>{t('markets.migrate-ticket-modal.current-round')}:</Label>
                    {liquidityPoolTicketDataQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader size={15} strokeWidth={6} />
                        </LoaderContainer>
                    ) : (
                        <Value>{liquidityPoolTicketData?.round || 0}</Value>
                    )}
                </MarketDataContainer>
                <InputContainer>
                    <NumericInput
                        value={newRound}
                        onChange={(_, value) => setNewRound(value)}
                        disabled={isMigrating}
                        label={t('markets.migrate-ticket-modal.new-round-label')}
                        placeholder={t('markets.migrate-ticket-modal.new-round-placeholder')}
                        inputPadding="5px 10px"
                        preventAutoFocus={true}
                    />
                </InputContainer>
                <InputContainer>
                    <NumericInput
                        value={ticketIndexInRound}
                        onChange={(_, value) => setTicketIndexInRound(value)}
                        disabled={isMigrating}
                        label={t('markets.migrate-ticket-modal.index-in-round-label')}
                        placeholder={t('markets.migrate-ticket-modal.index-in-round-placeholder')}
                        inputPadding="5px 10px"
                        preventAutoFocus={true}
                    />
                </InputContainer>
                {liquidityPoolTicketData && !liquidityPoolTicketData.foundInRound && (
                    <NotFoundValidation>{t('markets.migrate-ticket-modal.not-found-validaton')}</NotFoundValidation>
                )}
                <ButtonContainer isCancel={false}>{getMigrateTicketButton()}</ButtonContainer>
            </Container>
        </ReactModal>
    );
};

export default MigrateTicketModal;

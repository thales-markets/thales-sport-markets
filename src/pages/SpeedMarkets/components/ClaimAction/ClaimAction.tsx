import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import ApprovalModal from 'components/ApprovalModal/ApprovalModal';
import Button from 'components/Button/Button';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { USER_REJECTED_ERRORS } from 'constants/errors';
import { SWAP_APPROVAL_BUFFER } from 'constants/markets';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { differenceInSeconds, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { sumBy } from 'lodash';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import React, { Dispatch, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { coinParser, formatCurrencyWithSign, roundNumberToDecimals } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { UserPosition } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import {
    getCollateral,
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    getDefaultCollateral,
    isLpSupported,
} from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarkets/speedMarketsAMMContract';
import { isErrorExcluded } from 'utils/discord';
import { checkAllowance } from 'utils/network';
import { getPriceConnection, getPriceId } from 'utils/pyth';
import { refetchBalances, refetchUserResolvedSpeedMarkets, refetchUserSpeedMarkets } from 'utils/queryConnector';
import { executeBiconomyTransaction } from 'utils/smartAccount/biconomy/biconomy';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { resolveAllSpeedPositions } from 'utils/speedMarkets';
import { delay } from 'utils/timer';
import { Client, getContract } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

type ClaimActionProps = {
    positions: UserPosition[];
    claimCollateralIndex: number;
    isDisabled?: boolean;
    isActionInProgress?: boolean;
    setIsActionInProgress?: Dispatch<boolean>;
};

const ClaimAction: React.FC<ClaimActionProps> = ({
    positions,
    claimCollateralIndex,
    isDisabled,
    isActionInProgress,
    setIsActionInProgress,
}) => {
    const { t } = useTranslation();

    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, walletAddress);

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const isSinglePosition = useMemo(() => positions.length === 1, [positions.length]);
    const position = useMemo(() => positions[0], [positions]);
    const payout = useMemo(() => (isSinglePosition ? position.payout : sumBy(positions, 'payout')), [
        isSinglePosition,
        position.payout,
        positions,
    ]);

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const claimCollateralArray = useMemo(
        () =>
            getCollaterals(networkId).filter(
                (collateral) => !isLpSupported(collateral) || collateral === defaultCollateral
            ),
        [networkId, defaultCollateral]
    );
    const claimCollateral = useMemo(() => getCollateral(networkId, claimCollateralIndex, claimCollateralArray), [
        claimCollateralArray,
        networkId,
        claimCollateralIndex,
    ]);
    const claimCollateralAddress = useMemo(
        () => getCollateralAddress(networkId, claimCollateralIndex, claimCollateralArray),
        [networkId, claimCollateralIndex, claimCollateralArray]
    );

    const isDefaultCollateral = claimCollateral === defaultCollateral;
    const collateralAddress = multipleCollateral[claimCollateral].addresses[networkId];

    // Update action in progress status
    useEffect(() => {
        if (setIsActionInProgress) {
            setIsActionInProgress(isAllowing || isSubmitting);
        }
    }, [isAllowing, isSubmitting, setIsActionInProgress]);

    // check allowance
    useEffect(() => {
        if (isDefaultCollateral) {
            return;
        }

        const collateralIndex = getCollateralIndex(networkId, claimCollateral);
        const collateralContract = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client, networkId },
            collateralIndex
        );

        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const getAllowance = async () => {
            try {
                const parsedAmount = coinParser(payout.toString(), networkId);
                const allowance = await checkAllowance(
                    parsedAmount,
                    collateralContract,
                    walletAddress,
                    addressToApprove
                );
                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };

        if (isConnected) {
            getAllowance();
        }
    }, [
        payout,
        networkId,
        walletAddress,
        isBiconomy,
        isConnected,
        hasAllowance,
        isAllowing,
        isDefaultCollateral,
        client,
        claimCollateral,
        isDisabled,
        isActionInProgress,
    ]);

    const handleAllowance = async (approveAmount: bigint) => {
        const collateralIndex = getCollateralIndex(networkId, claimCollateral);
        const collateralContractWithSigner = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client: walletClient.data, networkId },
            collateralIndex
        );

        const addressToApprove = speedMarketsAMMContract.addresses[networkId];

        const id = toast.loading(t('speed-markets.progress'));
        try {
            setIsAllowing(true);
            let hash;
            if (isBiconomy) {
                hash = await executeBiconomyTransaction({
                    collateralAddress: claimCollateralAddress,
                    networkId,
                    contract: collateralContractWithSigner,
                    methodName: 'approve',
                    data: [addressToApprove, approveAmount],
                });
            } else {
                hash = await collateralContractWithSigner?.write.approve([addressToApprove, approveAmount]);
            }
            setOpenApprovalModal(false);
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                setAllowance(true);
                setIsAllowing(false);
            }
        } catch (e) {
            const isUserRejected = USER_REJECTED_ERRORS.some((rejectedError) =>
                ((e as Error).message + ((e as Error).stack || '')).includes(rejectedError)
            );
            toast.update(
                id,
                getErrorToastOptions(
                    isUserRejected ? t('common.errors.tx-canceled') : t('common.errors.unknown-error-try-again')
                )
            );
            setIsAllowing(false);
            setOpenApprovalModal(false);
            if (!isErrorExcluded(e as Error)) {
                console.log(e);
            }
        }
    };

    const handleResolve = async () => {
        const priceConnection = getPriceConnection(networkId);

        setIsSubmitting(true);
        const id = toast.loading(t('speed-markets.progress'));

        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[networkId],
                client,
            }) as ViemContract;

            const priceFeedUpdate = await priceConnection.getPriceUpdatesAtTimestamp(
                millisecondsToSeconds(position.maturityDate),
                [getPriceId(networkId, position.asset)]
            );

            const publishTime = priceFeedUpdate.parsed
                ? secondsToMilliseconds(priceFeedUpdate.parsed[0].price.publish_time)
                : Number.POSITIVE_INFINITY;

            // check if price feed is not too late
            if (
                ammSpeedMarketsLimitsData?.maxPriceDelayForResolvingSec &&
                differenceInSeconds(publishTime, position.maturityDate) >
                    ammSpeedMarketsLimitsData.maxPriceDelayForResolvingSec
            ) {
                await delay(800);
                toast.update(id, getErrorToastOptions(t('speed-markets.errors.price-stale')));
                setIsSubmitting(false);
                return;
            }

            const priceUpdateData = priceFeedUpdate.binary.data.map((vaa: string) => '0x' + vaa);
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            const isEth = collateralAddress === ZERO_ADDRESS;

            const speedMarketsAMMContractWithSigner = getContractInstance(ContractType.SPEED_MARKETS_AMM, {
                networkId,
                client: walletClient.data,
            }) as ViemContract;

            let hash;
            if (isBiconomy) {
                hash = isDefaultCollateral
                    ? await executeBiconomyTransaction({
                          collateralAddress,
                          networkId,
                          contract: speedMarketsAMMContractWithSigner,
                          methodName: 'resolveMarket',
                          data: [position.market, priceUpdateData],
                      })
                    : await executeBiconomyTransaction({
                          collateralAddress,
                          networkId,
                          contract: speedMarketsAMMContractWithSigner,
                          methodName: 'resolveMarketWithOfframp',
                          data: [position.market, priceUpdateData, collateralAddress, isEth],
                          value: undefined,
                          isEth,
                      });
            } else {
                hash = isDefaultCollateral
                    ? await speedMarketsAMMContractWithSigner.write.resolveMarket([position.market, priceUpdateData], {
                          value: updateFee,
                      })
                    : await speedMarketsAMMContractWithSigner.write.resolveMarketWithOfframp(
                          [position.market, priceUpdateData, collateralAddress, isEth],
                          { value: updateFee }
                      );
            }
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`speed-markets.user-positions.confirmation-message`)));
                refetchUserSpeedMarkets(networkId, walletAddress);
                refetchUserResolvedSpeedMarkets(networkId, walletAddress);
                refetchBalances(walletAddress, networkId);
            } else {
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.tx-reverted')));
            }
        } catch (e) {
            await delay(800);
            const isUserRejected = USER_REJECTED_ERRORS.some((rejectedError) =>
                ((e as Error).message + ((e as Error).stack || '')).includes(rejectedError)
            );
            toast.update(
                id,
                getErrorToastOptions(
                    isUserRejected ? t('common.errors.tx-canceled') : t('common.errors.unknown-error-try-again')
                )
            );
            if (!isErrorExcluded(e as Error)) {
                console.log(e);
            }
        }
        setIsSubmitting(false);
    };

    const handleResolveAll = async () => {
        setIsSubmitting(true);

        await resolveAllSpeedPositions(
            positions,
            false,
            { networkId, client: walletClient.data },
            isBiconomy,
            claimCollateralAddress
        );

        setIsSubmitting(false);
    };

    return (
        <>
            <Container>
                <Tooltip
                    open={!hasAllowance && !isDefaultCollateral}
                    overlay={t('speed-markets.tooltips.approve-swap-tooltip', {
                        currencyKey: claimCollateral,
                        defaultCurrency: defaultCollateral,
                    })}
                    zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                >
                    <Button
                        disabled={isSubmitting || isAllowing || isDisabled}
                        onClick={() =>
                            hasAllowance || isDefaultCollateral
                                ? isSinglePosition
                                    ? handleResolve()
                                    : handleResolveAll()
                                : setOpenApprovalModal(true)
                        }
                        width="100%"
                        height="25px"
                        fontSize="14px"
                        padding="3px 10px"
                    >
                        {hasAllowance || isDefaultCollateral ? (
                            `${
                                isSubmitting
                                    ? t(
                                          `speed-markets.user-positions.${
                                              isSinglePosition ? 'claim-progress' : 'claim-all-progress'
                                          }`
                                      )
                                    : t(
                                          `speed-markets.user-positions.${
                                              isSinglePosition
                                                  ? `claim${isDefaultCollateral ? '' : '-in'}`
                                                  : `claim-all${isDefaultCollateral ? '' : '-in'}`
                                          }`
                                      )
                            } ${isDefaultCollateral ? formatCurrencyWithSign(USD_SIGN, payout, 2) : claimCollateral}`
                        ) : isAllowing ? (
                            <Trans
                                i18nKey="common.enable-wallet-access.approve-progress-label"
                                values={{ currencyKey: defaultCollateral }}
                                components={{ currency: <CollateralText /> }}
                            />
                        ) : (
                            t('common.enable-wallet-access.approve-swap')
                        )}
                    </Button>
                </Tooltip>
            </Container>
            {openApprovalModal && (
                <ApprovalModal
                    // add three percent to approval amount to take into account price changes
                    defaultAmount={roundNumberToDecimals((1 + SWAP_APPROVAL_BUFFER) * payout)}
                    tokenSymbol={defaultCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    white-space: pre;
`;

const CollateralText = styled.span`
    text-transform: none;
`;

export default ClaimAction;

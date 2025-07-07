import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import { getErrorToastOptions, getInfoToastOptions, getSuccessToastOptions } from 'config/toast';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMinutes } from 'date-fns';
import { SpeedPositions } from 'enums/speedMarkets';
import i18n from 'i18n';
import { toast } from 'react-toastify';
import { NetworkConfig } from 'types/network';
import { UserPosition } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchUserSpeedMarkets } from 'utils/queryConnector';
import { delay } from 'utils/timer';
import { Address, Client, getContract } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { getContractAbi } from './contracts/abi';
import speedMarketsAMMContract from './contracts/speedMarkets/speedMarketsAMMContract';
import { executeBiconomyTransaction } from './smartAccount/biconomy/biconomy';

export const getTransactionForSpeedAMM = async (
    creatorContractWithSigner: any,
    asset: string,
    deltaTimeSec: number,
    sides: number[],
    buyInAmount: bigint,
    strikePrice: bigint,
    strikePriceSlippage: bigint,
    collateralAddress: string,
    referral: string | null,
    skewImpact?: bigint,
    isBiconomy?: boolean,
    isEth?: boolean
) => {
    let txHash;

    if (isBiconomy) {
        // TODO:
        const biconomyChainId = 10; // biconomyConnector.wallet?.biconomySmartAccountConfig.chainId as SupportedNetwork;

        txHash = await executeBiconomyTransaction({
            // collateralAddress: collateralAddress || erc20Contract.addresses[biconomyChainId],
            collateralAddress: collateralAddress as Address,
            networkId: biconomyChainId,
            contract: creatorContractWithSigner,
            methodName: 'addPendingSpeedMarket',
            data: [
                [
                    asset,
                    0,
                    deltaTimeSec,
                    strikePrice,
                    strikePriceSlippage,
                    sides[0],
                    collateralAddress || ZERO_ADDRESS,
                    buyInAmount,
                    referral || ZERO_ADDRESS,
                    skewImpact,
                ],
            ],
            value: undefined,
            isEth,
            buyInAmountParam: buyInAmount,
        });
    } else {
        txHash = await creatorContractWithSigner.write.addPendingSpeedMarket([
            [
                asset,
                0,
                deltaTimeSec,
                strikePrice,
                strikePriceSlippage,
                sides[0],
                collateralAddress || ZERO_ADDRESS,
                buyInAmount,
                referral || ZERO_ADDRESS,
                skewImpact,
            ],
        ]);
    }

    return txHash;
};

// get dynamic LP fee based on time threshold and delta time to maturity
export const getFeeByTimeThreshold = (
    deltaTimeSec: number,
    timeThresholds: number[], // in minutes - ascending order
    fees: number[],
    defaultFee: number
): number => {
    let index = -1;
    // iterate backwards and find index
    for (let i = timeThresholds.length - 1; i >= 0; i--) {
        if (secondsToMinutes(deltaTimeSec) >= timeThresholds[i]) {
            index = i;
            break;
        }
    }
    return index !== -1 ? fees[index] : defaultFee;
};

// when fees are missing from contract (for old markets) get hardcoded history fees
export const getFeesFromHistory = (txTimestampMilis: number) => {
    let safeBoxImpact;
    let lpFee;

    if (txTimestampMilis < 1693039265000) {
        // Until Aug-26-2023 08:41:05 PM +UTC
        safeBoxImpact = 0.01;
        lpFee = 0.04;
    } else if (txTimestampMilis < 1696157435000) {
        // Until Oct-01-2023 10:50:35 AM +UTC
        safeBoxImpact = 0.02;
        lpFee = 0.04;
    } else {
        // latest before added to contract
        safeBoxImpact = 0.02;
        lpFee = 0.05;
    }
    return { safeBoxImpact, lpFee };
};

export const isUserWinner = (position: SpeedPositions, strikePrice: number, finalPrice: number) =>
    strikePrice > 0 && finalPrice > 0
        ? (position === SpeedPositions.UP && finalPrice > strikePrice) ||
          (position === SpeedPositions.DOWN && finalPrice < strikePrice)
        : undefined;

export const resolveAllSpeedPositions = async (
    positions: UserPosition[],
    isAdmin: boolean,
    networkConfig: NetworkConfig,
    isBiconomy?: boolean,
    collateralAddress?: string
) => {
    if (!positions.length) {
        return;
    }

    const priceConnection = getPriceConnection(networkConfig.networkId);

    const id = toast.loading(i18n.t('speed-markets.progress'));

    const speedMarketsAMMContractWithSigner = getContract({
        abi: getContractAbi(speedMarketsAMMContract, networkConfig.networkId),
        address: speedMarketsAMMContract.addresses[networkConfig.networkId],
        client: networkConfig.client,
    }) as ViemContract;

    const marketsToResolve: string[] = isAdmin
        ? positions.filter((position) => !!position.finalPrice).map((position) => position.market)
        : [];
    const manualFinalPrices: number[] = isAdmin
        ? positions
              .filter((position) => !!position.finalPrice)
              .map((position) => Number(priceParser(position.finalPrice || 0)))
        : [];
    const priceUpdateDataArray: string[] = [];
    let totalUpdateFee = BigInt(0);

    for (const position of positions) {
        if (isAdmin) {
            break;
        }
        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[networkConfig.networkId],
                client: networkConfig.client,
            }) as ViemContract;

            const priceFeedUpdate = await priceConnection.getPriceUpdatesAtTimestamp(
                millisecondsToSeconds(position.maturityDate),
                [getPriceId(networkConfig.networkId, position.asset)]
            );

            const priceUpdateData = priceFeedUpdate.binary.data.map((vaa: string) => '0x' + vaa);
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            marketsToResolve.push(position.market);
            priceUpdateDataArray.push(priceUpdateData[0]);
            totalUpdateFee = totalUpdateFee + updateFee;
        } catch (e) {
            console.log(`Can't fetch VAA from Pyth API for market ${position.market}`, e);
        }
    }

    if (marketsToResolve.length > 0) {
        try {
            let hash;
            if (isBiconomy && collateralAddress) {
                hash = isAdmin
                    ? await executeBiconomyTransaction({
                          collateralAddress: collateralAddress as Address,
                          networkId: networkConfig.networkId,
                          contract: speedMarketsAMMContractWithSigner,
                          methodName: 'resolveMarketManuallyBatch',
                          data: [marketsToResolve, manualFinalPrices],
                      })
                    : await executeBiconomyTransaction({
                          collateralAddress: collateralAddress as Address,
                          networkId: networkConfig.networkId,
                          contract: speedMarketsAMMContractWithSigner,
                          methodName: 'resolveMarketsBatch',
                          data: [marketsToResolve, priceUpdateDataArray],
                      });
            } else {
                hash = isAdmin
                    ? await speedMarketsAMMContractWithSigner.write.resolveMarketManuallyBatch([
                          marketsToResolve,
                          manualFinalPrices,
                      ])
                    : await speedMarketsAMMContractWithSigner.write.resolveMarketsBatch(
                          [marketsToResolve, priceUpdateDataArray],
                          {
                              value: totalUpdateFee,
                          }
                      );
            }

            const txReceipt = await waitForTransactionReceipt(networkConfig.client as Client, { hash });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(i18n.t('speed-markets.user-positions.confirmation-message')));
                await delay(2000);

                const walletAddress = isBiconomy
                    ? '' // TODO: biconomyConnector.address
                    : (networkConfig.client as Client)?.account?.address;
                if (walletAddress) {
                    refetchUserSpeedMarkets(networkConfig.networkId, walletAddress);
                }
                refetchActiveSpeedMarkets(networkConfig.networkId);
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again')));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again')));
        }
    } else {
        toast.update(id, getInfoToastOptions(i18n.t('speed-markets.user-positions.no-resolve-positions')));
    }
};

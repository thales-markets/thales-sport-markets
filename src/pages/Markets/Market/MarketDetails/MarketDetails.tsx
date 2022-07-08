import {
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    ScoreLabel,
    WinnerLabel,
} from 'components/common';
import React, { useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { AMMPosition, AvailablePerSide, Balances, MarketData } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource } from 'utils/images';
import {
    InfoRow,
    InfoTitle,
    InfoValue,
    MarketContainer,
    MatchInfo,
    OddsContainer,
    Option,
    OptionTeamName,
    Pick,
    Slider,
    SliderContainer,
    SliderInfo,
    StatusSourceContainer,
    StatusSourceInfo,
    SliderInfoTitle,
    SliderInfoValue,
    AmountToBuyInput,
    SubmitButton,
    AmountInfo,
    MaxButton,
    AmountToBuyContainer,
    MatchDate,
    MatchInfoColumn,
    Status,
    ClaimButton,
    ClaimableAmount,
    MarketHeader,
    AmountToBuyLabel,
    Separator,
    CustomTooltip,
} from './styled-components/MarketDetails';
import { FlexDivCentered } from '../../../../styles/common';
import { MAX_L2_GAS_LIMIT, Position, Side } from '../../../../constants/options';
import Toggle from '../../../../components/Toggle/Toggle';
import networkConnector from '../../../../utils/networkConnector';
import { checkAllowance } from '../../../../utils/network';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import ApprovalModal from '../../../../components/ApprovalModal/ApprovalModal';
import { PAYMENT_CURRENCY, USD_SIGN } from '../../../../constants/currency';
import { MAX_GAS_LIMIT } from '../../../../constants/network';
import {
    floorNumberToDecimals,
    formatCurrency,
    formatCurrencyWithSign,
    formatPercentage,
} from '../../../../utils/formatters/number';
import usePositionPriceDetailsQuery from '../../../../queries/markets/usePositionPriceDetailsQuery';
import useMarketBalancesQuery from '../../../../queries/markets/useMarketBalancesQuery';
import CollateralSelector from './CollateralSelector';
import { COLLATERALS } from 'constants/markets';
import { getAMMSportsTransaction, getSportsAMMQuoteMethod } from 'utils/amm';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import useAvailablePerSideQuery from '../../../../queries/markets/useAvailablePerSideQuery';
import { ODDS_COLOR } from '../../../../constants/ui';
import useMultipleCollateralBalanceQuery from '../../../../queries/wallet/useMultipleCollateralBalanceQuery';
import { getIsAppReady } from '../../../../redux/modules/app';
import { toast } from 'react-toastify';
import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import { useTranslation } from 'react-i18next';
import WalletInfo from '../WalletInfo';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';

type MarketDetailsProps = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [selectedStableIndex, setStableIndex] = useState<number>(0);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [amount, setAmountValue] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const [selectedSide, setSelectedSide] = useState<Side>(Side.BUY);
    const [claimable, setClaimable] = useState<boolean>(false);
    const [claimableAmount, setClaimableAmount] = useState<number>(0);
    const [tooltipText, setTooltipText] = useState<string>('');
    const [availablePerSide, setavailablePerSide] = useState<AvailablePerSide>({
        positions: {
            [Position.HOME]: {
                available: 0,
            },
            [Position.AWAY]: {
                available: 0,
            },
            [Position.DRAW]: {
                available: 0,
            },
        },
    });
    const [ammPosition, setAmmPosition] = useState<AMMPosition>({
        sides: {
            [Side.BUY]: {
                quote: 0,
                priceImpact: 0,
            },
            [Side.SELL]: {
                quote: 0,
                priceImpact: 0,
            },
        },
    });
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [maxAmount, setMaxAmount] = useState<number>(0);

    useEffect(() => {
        setStableIndex(0);
    }, [selectedSide]);

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        selectedPosition,
        Number(amount) || 1,
        selectedStableIndex,
        networkId
    );

    const multipleStableBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const paymentTokenBalance = useMemo(() => {
        if (multipleStableBalances.data && multipleStableBalances.isSuccess) {
            return Number(multipleStableBalances.data[COLLATERALS[selectedStableIndex]].toFixed(2));
        }
        return 0;
    }, [multipleStableBalances.data, selectedStableIndex]);

    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide);

    useEffect(() => {
        if (positionPriceDetailsQuery.isSuccess && positionPriceDetailsQuery.data) {
            setAmmPosition(positionPriceDetailsQuery.data);
        }
    }, [positionPriceDetailsQuery.isSuccess, positionPriceDetailsQuery.data]);

    useEffect(() => {
        if (availablePerSideQuery.isSuccess && availablePerSideQuery.data) {
            setavailablePerSide(availablePerSideQuery.data);
        }
    }, [availablePerSideQuery.isSuccess, availablePerSideQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    useEffect(() => {
        if (balances) {
            if (market.resolved) {
                if (
                    market.finalResult !== 0 &&
                    //@ts-ignore
                    balances?.[Position[market.finalResult - 1].toLowerCase()] > 0
                ) {
                    setClaimable(true);
                    //@ts-ignore
                    setClaimableAmount(balances?.[Position[market.finalResult - 1].toLowerCase()] > 0);
                } else if (market.finalResult === 0) {
                    if (balances.home > 0 || balances.draw > 0 || balances.away > 0) {
                        setClaimable(true);
                        setClaimableAmount(balances.home + balances.draw + balances.away);
                    }
                }
            }
        }
    }, [balances]);

    useEffect(() => {
        setAmount(0);
    }, [selectedStableIndex]);

    useEffect(() => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            let collateralContractWithSigner: ethers.Contract | undefined;

            if (selectedStableIndex !== 0 && multipleCollateral) {
                collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
            } else {
                collateralContractWithSigner = sUSDContract?.connect(signer);
            }

            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = ethers.utils.parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
                        collateralContractWithSigner,
                        walletAddress,
                        sportsAMMContract.address
                    );
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected) {
                getAllowance();
            }
        }
    }, [walletAddress, isWalletConnected, hasAllowance, isAllowing, amount, selectedStableIndex]);

    const fetchAmmQuote = async (amountForQuote: number) => {
        const { sportsAMMContract, signer } = networkConnector;
        if (sportsAMMContract && signer) {
            const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
            const parsedAmount = ethers.utils.parseEther(amountForQuote.toString());
            const ammQuote = await getSportsAMMQuoteMethod(
                selectedSide == Side.BUY,
                selectedStableIndex,
                networkId,
                sportsAMMContractWithSigner,
                market.address,
                selectedPosition,
                parsedAmount
            );

            if (selectedStableIndex !== 0) {
                return ammQuote[0];
            }

            return ammQuote;
        }
    };

    const handleSubmit = async () => {
        if (!!amount) {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                setIsBuying(true);
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const ammQuote = await fetchAmmQuote(+amount || 1);
                const parsedAmount = ethers.utils.parseEther(amount.toString());
                const id = toast.loading(t('market.toast-messsage.transaction-pending'));
                console.log('selectedStableIndex ', selectedStableIndex);
                console.log('parsedAmount ', parsedAmount);
                try {
                    const tx = await getAMMSportsTransaction(
                        selectedSide === Side.BUY,
                        selectedStableIndex,
                        networkId,
                        sportsAMMContractWithSigner,
                        market.address,
                        selectedPosition,
                        parsedAmount,
                        ammQuote,
                        ethers.utils.parseEther('0.02'),
                        { gasLimit: MAX_L2_GAS_LIMIT }
                    );

                    const txResult = await tx.wait();

                    if (txResult && txResult.transactionHash) {
                        selectedSide === Side.BUY
                            ? toast.update(id, getSuccessToastOptions(t('market.toast-messsage.buy-success')))
                            : toast.update(id, getSuccessToastOptions(t('market.toast-messsage.sell-success')));
                        setIsBuying(false);
                        setAmount(0);
                    }
                } catch (e) {
                    setIsBuying(false);
                    toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    console.log('Error ', e);
                }
            }
        }
    };

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (sportsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                let collateralContractWithSigner: ethers.Contract | undefined;

                if (selectedStableIndex !== 0 && multipleCollateral && multipleCollateral[selectedStableIndex]) {
                    collateralContractWithSigner = multipleCollateral[selectedStableIndex]?.connect(signer);
                } else {
                    collateralContractWithSigner = sUSDContract?.connect(signer);
                }

                const addressToApprove = sportsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.approve-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    useEffect(() => {
        const getMaxAmount = async () => {
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const price = ammPosition.sides[selectedSide].quote / (+amount || 1);

                    console.log('paymentTokenBalance ', paymentTokenBalance);
                    if (price && paymentTokenBalance) {
                        let tmpSuggestedAmount = Number(paymentTokenBalance) / Number(price);
                        if (tmpSuggestedAmount > availablePerSide.positions[selectedPosition].available) {
                            setMaxAmount(floorNumberToDecimals(availablePerSide.positions[selectedPosition].available));
                            return;
                        }

                        const ammQuote = await fetchAmmQuote(tmpSuggestedAmount);

                        const ammPrice =
                            bigNumberFormmaterWithDecimals(
                                ammQuote,
                                selectedStableIndex == 0 || selectedStableIndex == 1 ? 18 : 6
                            ) / Number(tmpSuggestedAmount);
                        // 2 === slippage
                        tmpSuggestedAmount = (Number(paymentTokenBalance) / Number(ammPrice)) * ((100 - 2) / 100);
                        setMaxAmount(floorNumberToDecimals(tmpSuggestedAmount));
                        return;
                    }
                }
            } else {
                //@ts-ignore
                setMaxAmount(balances?.[Position[selectedPosition].toLowerCase()] || 0);
                return;
            }
        };
        getMaxAmount();
    }, [selectedSide, amount, balances, paymentTokenBalance, ammPosition, selectedStableIndex]);

    const onMaxClick = async () => {
        setAmount(maxAmount);
    };

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
            contract.connect(signer);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                const tx = await contract.exerciseOptions();
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    if (market.finalResult === 0) {
                        toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-refund-success')));
                    } else {
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    useEffect(() => {
        const checkDisabled = async () => {
            if (!hasAllowance) {
                setSubmitDisabled(false);
                return;
            }

            if (!amount || isBuying || isAllowing) {
                setSubmitDisabled(true);
                return;
            }

            if (selectedSide === Side.BUY) {
                setSubmitDisabled(!paymentTokenBalance || amount > maxAmount);
                return;
            }

            setSubmitDisabled(false);
        };
        checkDisabled();
    }, [amount, isBuying, isAllowing, hasAllowance]);

    const setTooltipTextMessage = (value: string | number) => {
        if (selectedSide === Side.BUY) {
            if (Number(value) > availablePerSide.positions[selectedPosition].available) {
                setTooltipText('Amount exceeded the amount available on AMM');
            } else if (Number(value) > maxAmount) {
                setTooltipText('Please ensure your wallet has enough funds');
            } else {
                setTooltipText('');
            }
        } else {
            if (Number(value) > availablePerSide.positions[selectedPosition].available) {
                setTooltipText('Amount exceeded the amount available on AMM');
            } else if (Number(value) > maxAmount) {
                setTooltipText('Please ensure your wallet has enough funds');
            } else {
                setTooltipText('');
            }
        }
    };

    const setAmount = (value: string | number) => {
        setAmountValue(value);
        setTooltipTextMessage(value);
    };

    return (
        <MarketContainer>
            <WalletInfo marketAddress={market.address} />
            {!market.resolved && (
                <MarketHeader>
                    <FlexDivCentered>
                        <Toggle
                            label={{ firstLabel: Side.BUY, secondLabel: Side.SELL, fontSize: '18px' }}
                            active={selectedSide === Side.SELL}
                            dotSize="18px"
                            dotBackground="#303656"
                            dotBorder="3px solid #3FD1FF"
                            handleClick={() => {
                                setSelectedSide(selectedSide === Side.BUY ? Side.SELL : Side.BUY);
                                setAmount('');
                            }}
                        />
                    </FlexDivCentered>
                    {selectedSide == Side.BUY && !market.resolved && (
                        <CollateralSelector
                            collateralArray={COLLATERALS}
                            selectedItem={selectedStableIndex}
                            onChangeCollateral={(index) => setStableIndex(index)}
                        />
                    )}
                </MarketHeader>
            )}

            {market.gameStarted && (
                <Status resolved={market.resolved} claimable={claimable}>
                    {!market.resolved ? 'Started' : claimable ? 'Claimable' : 'Finished'}
                </Status>
            )}
            {market.resolved && !market.gameStarted && (
                <Status resolved={market.resolved} claimable={false}>
                    Cancelled
                </Status>
            )}
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer isWinner={market.finalResult == 1} finalResult={market.finalResult}>
                        <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                    {market.resolved && market.gameStarted && (
                        <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                            WINNER
                        </WinnerLabel>
                    )}
                    <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                    {market.resolved && market.gameStarted && <ScoreLabel>{market.homeScore}</ScoreLabel>}
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchVSLabel>VS</MatchVSLabel>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer isWinner={market.finalResult == 2} finalResult={market.finalResult}>
                        <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                    {market.resolved && market.gameStarted && (
                        <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                            WINNER
                        </WinnerLabel>
                    )}

                    <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                    {market.resolved && market.gameStarted && <ScoreLabel>{market.awayScore}</ScoreLabel>}
                </MatchInfoColumn>
            </MatchInfo>
            <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
            {!market.gameStarted && !market.resolved && (
                <OddsContainer>
                    <Pick
                        selected={selectedPosition === Position.HOME}
                        onClick={() => {
                            setSelectedPosition(Position.HOME);
                            setAmount('');
                        }}
                    >
                        <Option color={ODDS_COLOR.HOME}>1</Option>
                        <OptionTeamName>{market.homeTeam.toUpperCase()}</OptionTeamName>
                        <InfoRow>
                            <InfoTitle>PRICE:</InfoTitle>
                            <InfoValue>
                                $ {market.positions[Position.HOME].sides[selectedSide].odd.toFixed(2)}
                            </InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>LIQUIDITY:</InfoTitle>
                            <InfoValue>
                                {availablePerSideQuery.isLoading
                                    ? '-'
                                    : floorNumberToDecimals(availablePerSide.positions[Position.HOME].available)}
                            </InfoValue>
                        </InfoRow>
                    </Pick>
                    {!!market.positions[Position.DRAW].sides[selectedSide].odd && (
                        <Pick
                            selected={selectedPosition === Position.DRAW}
                            onClick={() => {
                                setSelectedPosition(Position.DRAW);
                                setAmount('');
                            }}
                        >
                            <Option color={ODDS_COLOR.DRAW}>X</Option>
                            <OptionTeamName>DRAW</OptionTeamName>
                            <InfoRow>
                                <InfoTitle>PRICE:</InfoTitle>
                                <InfoValue>
                                    $ {market.positions[Position.DRAW].sides[selectedSide].odd.toFixed(2)}
                                </InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoTitle>LIQUIDITY:</InfoTitle>
                                <InfoValue>
                                    {availablePerSideQuery.isLoading
                                        ? '-'
                                        : floorNumberToDecimals(availablePerSide.positions[Position.DRAW].available)}
                                </InfoValue>
                            </InfoRow>
                        </Pick>
                    )}
                    <Pick
                        selected={selectedPosition === Position.AWAY}
                        onClick={() => {
                            setSelectedPosition(Position.AWAY);
                            setAmount('');
                        }}
                    >
                        <Option color={ODDS_COLOR.AWAY}>2</Option>
                        <OptionTeamName>{market.awayTeam.toUpperCase()}</OptionTeamName>
                        <InfoRow>
                            <InfoTitle>PRICE:</InfoTitle>
                            <InfoValue>
                                $ {market.positions[Position.AWAY].sides[selectedSide].odd.toFixed(2)}
                            </InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>LIQUIDITY:</InfoTitle>
                            <InfoValue>
                                {availablePerSideQuery.isLoading
                                    ? '-'
                                    : floorNumberToDecimals(availablePerSide.positions[Position.AWAY].available)}
                            </InfoValue>
                        </InfoRow>
                    </Pick>
                </OddsContainer>
            )}
            {!market.gameStarted && !market.resolved && (
                <>
                    <AmountToBuyLabel>Amount to {selectedSide.toLowerCase()}:</AmountToBuyLabel>
                    <FlexDivCentered>
                        <CustomTooltip open={!!tooltipText} title={tooltipText}>
                            <AmountToBuyContainer>
                                <AmountToBuyInput
                                    type="number"
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                    }}
                                    value={amount}
                                />
                                <MaxButton onClick={onMaxClick}>Max</MaxButton>
                            </AmountToBuyContainer>
                        </CustomTooltip>
                        <AmountToBuyContainer>
                            <AmountInfo>
                                <SliderInfoValue>
                                    {`= $${
                                        !amount || positionPriceDetailsQuery.isLoading
                                            ? ''
                                            : formatCurrency(ammPosition.sides[selectedSide].quote, 3, true)
                                    }`}
                                </SliderInfoValue>
                            </AmountInfo>
                        </AmountToBuyContainer>
                    </FlexDivCentered>
                    <SliderContainer>
                        <Slider
                            type="range"
                            min={0}
                            max={availablePerSide.positions[selectedPosition].available}
                            value={amount || 0}
                            step={1}
                            onChange={(event) => {
                                setAmount(event.currentTarget.valueAsNumber);
                            }}
                        />
                    </SliderContainer>
                    <FlexDivCentered>
                        <SubmitButton
                            disabled={submitDisabled}
                            onClick={async () => {
                                if (!!amount) {
                                    if (hasAllowance) {
                                        await handleSubmit();
                                    } else {
                                        setOpenApprovalModal(true);
                                    }
                                }
                            }}
                        >
                            {hasAllowance ? selectedSide : 'APPROVE'}
                        </SubmitButton>
                    </FlexDivCentered>
                    <FlexDivCentered>
                        <SliderInfo>
                            <SliderInfoTitle>Skew:</SliderInfoTitle>
                            <SliderInfoValue>
                                {positionPriceDetailsQuery.isLoading
                                    ? '-'
                                    : formatPercentage(ammPosition.sides[selectedSide].priceImpact)}
                            </SliderInfoValue>
                        </SliderInfo>
                        {selectedSide === Side.BUY && (
                            <>
                                <Separator>|</Separator>
                                <SliderInfo>
                                    <SliderInfoTitle>Potential profit:</SliderInfoTitle>
                                    <SliderInfoValue>
                                        {!amount || positionPriceDetailsQuery.isLoading
                                            ? '-'
                                            : `$${formatCurrency(
                                                  Number(amount) - ammPosition.sides[selectedSide].quote
                                              )} (${formatPercentage(
                                                  1 / (ammPosition.sides[selectedSide].quote / Number(amount)) - 1
                                              )})`}
                                    </SliderInfoValue>
                                </SliderInfo>
                            </>
                        )}
                    </FlexDivCentered>
                    <StatusSourceContainer>
                        <StatusSourceInfo />
                        <StatusSourceInfo />
                    </StatusSourceContainer>
                    {openApprovalModal && (
                        <ApprovalModal
                            defaultAmount={amount}
                            tokenSymbol={PAYMENT_CURRENCY}
                            isAllowing={isAllowing}
                            onSubmit={handleAllowance}
                            onClose={() => setOpenApprovalModal(false)}
                        />
                    )}
                </>
            )}
            {claimable && (
                <ClaimableAmount>
                    Amount Claimable: <span>{formatCurrencyWithSign(USD_SIGN, claimableAmount)}</span>
                </ClaimableAmount>
            )}
            {claimable && (
                <ClaimButton cancelled={market.resolved && !market.gameStarted} onClick={claimReward.bind(this)}>
                    {market.resolved && !market.gameStarted ? 'Claim Back' : 'Claim'}
                </ClaimButton>
            )}
        </MarketContainer>
    );
};

export default MarketDetails;

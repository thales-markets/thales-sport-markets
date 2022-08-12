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
import { AMMPosition, AvailablePerSide, Balances, MarketData, Odds } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource, OVERTIME_LOGO } from 'utils/images';
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
    LabelContainer,
    FooterContainer,
} from './styled-components/MarketDetails';
import { FlexDivCentered } from '../../../../styles/common';
import { DenominationType, MAX_L2_GAS_LIMIT, Position, Side } from '../../../../constants/options';
import Toggle from '../../../../components/Toggle/Toggle';
import networkConnector from '../../../../utils/networkConnector';
import { checkAllowance } from '../../../../utils/network';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from '../../../../redux/modules/wallet';
import ApprovalModal from '../../../../components/ApprovalModal/ApprovalModal';
import { USD_SIGN } from '../../../../constants/currency';
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
import { refetchBalances } from 'utils/queryConnector';
import onboardConnector from 'utils/onboardConnector';
import { getReferralId } from 'utils/referral';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import useMarketCancellationOddsQuery from 'queries/markets/useMarketCancellationOddsQuery';
import { fetchAmountOfTokensForXsUSDAmount } from 'utils/skewCalculator';
import debounce from 'lodash/debounce';

type MarketDetailsProps = {
    market: MarketData;
    selectedSide: Side;
    setSelectedSide: (side: Side) => void;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market, selectedSide, setSelectedSide }) => {
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
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [amount, setAmountValue] = useState<number | string>('');
    const [usdAmountValue, setUSDAmountValue] = useState<number | string>('');
    const [tokenAmount, setTokenAmount] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const [claimable, setClaimable] = useState<boolean>(false);
    const [claimableAmount, setClaimableAmount] = useState<number>(0);
    const [oddsOnCancellation, setOddsOnCancellation] = useState<Odds | undefined>(undefined);
    const [denominationType, setDenominationType] = useState<DenominationType>(DenominationType.USD);
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

    const { trackEvent } = useMatomo();

    const referralId =
        walletAddress && getReferralId()?.toLowerCase() !== walletAddress.toLowerCase() ? getReferralId() : null;

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
        const fetchData = async () => {
            const { sportsAMMContract, signer } = networkConnector;
            if (signer && sportsAMMContract) {
                const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
                contract.connect(signer);
                const parsedMaxAmount = ethers.utils.parseEther(
                    floorNumberToDecimals(availablePerSide.positions[selectedPosition].available).toString()
                );
                const [sUSDToSpendForMaxAmount, ammBalances] = await Promise.all([
                    sportsAMMContract?.buyFromAmmQuote(market.address, selectedPosition, parsedMaxAmount),
                    contract.balancesOf(sportsAMMContract?.address),
                ]);
                const ammBalanceForSelectedPosition = ammBalances[selectedPosition];

                const X = fetchAmountOfTokensForXsUSDAmount(
                    Number(usdAmountValue),
                    Number((market.positions[selectedPosition] as any).sides[Side.BUY].odd / 1),
                    sUSDToSpendForMaxAmount / 1e18,
                    availablePerSide.positions[selectedPosition].available,
                    ammBalanceForSelectedPosition / 1e18
                );

                const parsedAmount = ethers.utils.parseEther(floorNumberToDecimals(X).toString());
                const quote = await sportsAMMContract?.buyFromAmmQuote(market.address, selectedPosition, parsedAmount);

                const usdAmountValueAsNumber = Number(usdAmountValue);
                const parsedQuote = quote / 1e18;

                const recalculatedTokenAmount = (X * usdAmountValueAsNumber) / parsedQuote;

                setTokenAmount(recalculatedTokenAmount);

                const parsedRecalculatedAmount = ethers.utils.parseEther(
                    floorNumberToDecimals(recalculatedTokenAmount).toString()
                );
                const recQuote = await sportsAMMContract?.buyFromAmmQuote(
                    market.address,
                    selectedPosition,
                    parsedRecalculatedAmount
                );

                console.log(recQuote / 1e18);
            }
        };

        fetchData().catch((e) => console.log(e));
    }, [usdAmountValue]);

    const setUSDAmount = (event: any) => {
        setUSDAmountValue(event.target.value);
    };

    const debouncedUSDAmountHandler = useMemo(() => debounce(setUSDAmount, 500), []);

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

    const marketCancellationOddsQuery = useMarketCancellationOddsQuery(market?.address || '', {
        enabled: market?.cancelled,
    });

    useEffect(() => {
        if (marketCancellationOddsQuery.isSuccess && marketCancellationOddsQuery.data) {
            setOddsOnCancellation(marketCancellationOddsQuery.data);
        }
    }, [marketCancellationOddsQuery.isSuccess, marketCancellationOddsQuery.data]);

    useEffect(() => {
        if (balances) {
            if (market.resolved) {
                if (market.cancelled) {
                    if (balances.home > 0 || balances.draw > 0 || balances.away > 0) {
                        setClaimable(true);
                        setClaimableAmount(
                            balances.home * (oddsOnCancellation?.home || 0) +
                                balances.draw * (oddsOnCancellation?.draw || 0) +
                                balances.away * (oddsOnCancellation?.away || 0)
                        );
                    }
                } else if (
                    market.finalResult !== 0 &&
                    //@ts-ignore
                    balances?.[Position[market.finalResult - 1].toLowerCase()] > 0
                ) {
                    setClaimable(true);
                    //@ts-ignore
                    setClaimableAmount(balances?.[Position[market.finalResult - 1].toLowerCase()]);
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
        setMaxAmount(0);
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
                const ammQuote = await fetchAmmQuote(+Number(amount).toFixed(2) || 1);
                const parsedAmount = ethers.utils.parseEther(Number(amount).toFixed(2));
                const id = toast.loading(t('market.toast-messsage.transaction-pending'));

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
                        referralId,
                        ethers.utils.parseEther('0.02'),
                        { gasLimit: MAX_L2_GAS_LIMIT }
                    );

                    const txResult = await tx.wait();

                    if (txResult && txResult.transactionHash) {
                        refetchBalances(walletAddress, networkId);
                        selectedSide === Side.BUY
                            ? toast.update(id, getSuccessToastOptions(t('market.toast-messsage.buy-success')))
                            : toast.update(id, getSuccessToastOptions(t('market.toast-messsage.sell-success')));
                        setIsBuying(false);
                        setAmount(0);

                        if (selectedSide === Side.BUY) {
                            trackEvent({
                                category: 'AMM',
                                action: `buy-with-${COLLATERALS[selectedStableIndex]}`,
                                value: Number(formatCurrency(ammPosition.sides[Side.BUY].quote, 3, true)),
                            });
                        } else {
                            trackEvent({
                                category: 'AMM',
                                action: 'sell-to-amm',
                            });
                        }
                    }
                } catch (e) {
                    setIsBuying(false);
                    refetchBalances(walletAddress, networkId);
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
            setIsFetching(true);
            if (selectedSide === Side.BUY) {
                const { sportsAMMContract, signer } = networkConnector;
                if (sportsAMMContract && signer) {
                    const price = ammPosition.sides[selectedSide].quote / (+Number(amount).toFixed(2) || 1);
                    if (price > 0 && paymentTokenBalance) {
                        let tmpSuggestedAmount = Number(paymentTokenBalance) / Number(price);
                        if (tmpSuggestedAmount > availablePerSide.positions[selectedPosition].available) {
                            setMaxAmount(floorNumberToDecimals(availablePerSide.positions[selectedPosition].available));
                            setIsFetching(false);
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
                    }
                }
                setIsFetching(false);
            } else {
                //@ts-ignore
                setMaxAmount(balances?.[Position[selectedPosition].toLowerCase()] || 0);
            }
            setIsFetching(false);
            return;
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
                        toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-winnings-success')));
                    }
                    setClaimable(false);
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

            if (!Number(amount) || Number(amount) < 1 || isBuying || isAllowing) {
                setSubmitDisabled(true);
                return;
            }

            if (selectedSide === Side.BUY) {
                setSubmitDisabled(!paymentTokenBalance || amount > maxAmount);
                return;
            } else {
                setSubmitDisabled(amount > maxAmount);
                return;
            }
        };
        checkDisabled();
    }, [amount, isBuying, isAllowing, hasAllowance, selectedSide, paymentTokenBalance, maxAmount]);

    const setTooltipTextMessage = (value: string | number) => {
        if (Number(value) > availablePerSide.positions[selectedPosition].available) {
            setTooltipText('Amount exceeded the amount available on AMM');
        } else if (Number(value) > maxAmount) {
            setTooltipText('Please ensure your wallet has enough funds');
        } else if (value && Number(value) < 1) {
            setTooltipText('Minimal amount is 1');
        } else {
            setTooltipText('');
        }
    };

    const setAmount = (value: string | number) => {
        setAmountValue(value);
        setTooltipTextMessage(value);
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton disabled={submitDisabled} onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        if (!hasAllowance) {
            return (
                <SubmitButton
                    disabled={submitDisabled}
                    onClick={async () => {
                        if (!!amount) {
                            setOpenApprovalModal(true);
                        }
                    }}
                >
                    {t('common.wallet.approve')}
                </SubmitButton>
            );
        }

        return (
            <SubmitButton
                disabled={submitDisabled}
                onClick={async () => {
                    if (!!amount) {
                        handleSubmit();
                    }
                }}
            >
                {selectedSide}
            </SubmitButton>
        );
    };

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam]);

    return (
        <MarketContainer>
            <WalletInfo market={market} />
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
                    {!market.resolved ? 'Pending resolution' : claimable ? 'Claimable' : 'Finished'}
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
                        <MatchParticipantImage
                            alt="Home team logo"
                            src={homeLogoSrc}
                            onError={() => setHomeLogoSrc(OVERTIME_LOGO)}
                        />
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
                        <MatchParticipantImage
                            alt="Away team logo"
                            src={awayLogoSrc}
                            onError={() => setAwayLogoSrc(OVERTIME_LOGO)}
                        />
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
            {market.resolved && !market.gameStarted && <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>}
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
                    <Toggle
                        label={{ firstLabel: 'Enter tokens amount', secondLabel: 'Enter USD amount', fontSize: '18px' }}
                        active={denominationType === DenominationType.USD}
                        dotSize="18px"
                        dotBackground="#303656"
                        dotBorder="3px solid #3FD1FF"
                        handleClick={() => {
                            setAmount('');
                            setUSDAmountValue('');
                            setDenominationType(
                                denominationType === DenominationType.TOKEN
                                    ? DenominationType.USD
                                    : DenominationType.TOKEN
                            );
                        }}
                    />
                    {denominationType === DenominationType.TOKEN && (
                        <>
                            <LabelContainer>
                                <AmountToBuyLabel>Amount to {selectedSide.toLowerCase()}:</AmountToBuyLabel>
                                <AmountToBuyLabel>
                                    {selectedSide === Side.BUY ? 'Total to pay' : 'Total to receive'}:
                                </AmountToBuyLabel>
                            </LabelContainer>
                            <FlexDivCentered>
                                <CustomTooltip open={!!tooltipText && !openApprovalModal} title={tooltipText}>
                                    <AmountToBuyContainer>
                                        <AmountToBuyInput
                                            type="number"
                                            onChange={(e) => {
                                                if (Number(e.target.value) >= 0) {
                                                    setAmount(e.target.value);
                                                }
                                            }}
                                            value={amount}
                                        />
                                        <MaxButton disabled={isFetching} onClick={onMaxClick}>
                                            Max
                                        </MaxButton>
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
                        </>
                    )}
                    {denominationType === DenominationType.USD && (
                        <>
                            <LabelContainer>
                                <AmountToBuyLabel>Total to pay:</AmountToBuyLabel>
                                <AmountToBuyLabel>Amount to {selectedSide.toLowerCase()}:</AmountToBuyLabel>
                            </LabelContainer>
                            <FlexDivCentered>
                                <CustomTooltip open={!!tooltipText && !openApprovalModal} title={tooltipText}>
                                    <AmountToBuyContainer>
                                        <AmountToBuyInput type="number" onChange={debouncedUSDAmountHandler} />
                                        <MaxButton disabled={isFetching} onClick={onMaxClick}>
                                            Max
                                        </MaxButton>
                                    </AmountToBuyContainer>
                                </CustomTooltip>
                                <AmountToBuyContainer>
                                    <AmountInfo>
                                        <SliderInfoValue>
                                            {`=${
                                                !usdAmountValue || positionPriceDetailsQuery.isLoading
                                                    ? ''
                                                    : formatCurrency(tokenAmount, 3, true)
                                            } tokens`}
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
                        </>
                    )}
                    <FlexDivCentered>{getSubmitButton()}</FlexDivCentered>
                    <FooterContainer>
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
                                        {!Number(amount) || positionPriceDetailsQuery.isLoading || !!tooltipText
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
                    </FooterContainer>
                    <StatusSourceContainer>
                        <StatusSourceInfo />
                        <StatusSourceInfo />
                    </StatusSourceContainer>
                    {openApprovalModal && (
                        <ApprovalModal
                            defaultAmount={amount}
                            tokenSymbol={COLLATERALS[selectedStableIndex]}
                            isAllowing={isAllowing}
                            onSubmit={handleAllowance}
                            onClose={() => setOpenApprovalModal(false)}
                        />
                    )}
                </>
            )}
            {claimable && (
                <ClaimableAmount>
                    Amount Claimable: <span>{formatCurrencyWithSign(USD_SIGN, claimableAmount, 2)}</span>
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

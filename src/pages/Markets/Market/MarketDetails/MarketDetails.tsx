import { MatchParticipantImage, MatchParticipantImageContainer, MatchVSLabel } from 'components/common';
import React, { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { AMMPosition, Balances, MarketData } from 'types/markets';
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
import { PAYMENT_CURRENCY } from '../../../../constants/currency';
import { MAX_GAS_LIMIT } from '../../../../constants/network';
import { formatCurrency, formatPercentage } from '../../../../utils/formatters/number';
import usePositionPriceDetailsQuery from '../../../../queries/markets/usePositionPriceDetailsQuery';
import usePaymentTokenBalanceQuery from '../../../../queries/wallet/usePaymentTokenBalanceQuery';
import useMarketBalancesQuery from '../../../../queries/markets/useMarketBalancesQuery';
import CollateralSelector from './CollateralSelector';
import { COLLATERALS } from 'constants/markets';

type MarketDetailsProps = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [selectedStableIndex, setStableIndex] = useState<number>(0);
    const [isBuying, setIsBuying] = useState<boolean>(false);
    const [amount, setAmount] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const [selectedSide, setSelectedSide] = useState<Side>(Side.BUY);
    const [ammPosition, setAmmPosition] = useState<AMMPosition>({
        sides: {
            [Side.BUY]: {
                available: 0,
                quote: 0,
                priceImpact: 0,
            },
            [Side.SELL]: {
                available: 0,
                quote: 0,
                priceImpact: 0,
            },
        },
    });
    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    const paymentTokenBalanceQuery = usePaymentTokenBalanceQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    const positionPriceDetailsQuery = usePositionPriceDetailsQuery(
        market.address,
        selectedPosition,
        Number(amount) || 1
    );

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    useEffect(() => {
        if (positionPriceDetailsQuery.isSuccess && positionPriceDetailsQuery.data) {
            setAmmPosition(positionPriceDetailsQuery.data);
        }
    }, [positionPriceDetailsQuery.isSuccess, positionPriceDetailsQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    useEffect(() => {
        const { sportsAMMContract, sUSDContract, signer } = networkConnector;
        if (sportsAMMContract && sUSDContract && signer) {
            const sUSDTokenContractWithSigner = sUSDContract.connect(signer);
            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = ethers.utils.parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
                        sUSDTokenContractWithSigner,
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
    }, [walletAddress, isWalletConnected, hasAllowance, isAllowing, amount]);

    const fetchAmmQuote = async (amountForQuote: number) => {
        const { sportsAMMContract, signer } = networkConnector;
        if (sportsAMMContract && signer) {
            const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
            const parsedAmount = ethers.utils.parseEther(amountForQuote.toString());
            return await (selectedSide === Side.BUY
                ? sportsAMMContractWithSigner?.buyFromAmmQuote(market.address, selectedPosition, parsedAmount)
                : sportsAMMContractWithSigner?.sellToAmmQuote(market.address, selectedPosition, parsedAmount));
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

                try {
                    if (selectedSide === Side.BUY) {
                        const tx = await sportsAMMContractWithSigner?.buyFromAMM(
                            market.address,
                            selectedPosition,
                            parsedAmount,
                            ammQuote,
                            ethers.utils.parseEther('0.02'),
                            { gasLimit: MAX_L2_GAS_LIMIT }
                        );
                        const txResult = await tx.wait();
                        if (txResult && txResult.transactionHash) {
                            setIsBuying(false);
                            setAmount(0);
                        }
                    } else {
                        const tx = await sportsAMMContractWithSigner?.sellToAMM(
                            market.address,
                            selectedPosition,
                            parsedAmount,
                            ammQuote,
                            ethers.utils.parseEther('0.02')
                        );
                        const txResult = await tx.wait();
                        if (txResult && txResult.transactionHash) {
                            setIsBuying(false);
                            setAmount(0);
                        }
                    }
                } catch (e) {
                    setIsBuying(false);
                }
            }
        }
    };

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { sportsAMMContract, sUSDContract, signer } = networkConnector;
        if (sportsAMMContract && sUSDContract && signer) {
            setIsAllowing(true);

            try {
                const sUSDTokenContractWithSigner = sUSDContract.connect(signer);
                const addressToApprove = sportsAMMContract.address;

                const tx = (await sUSDTokenContractWithSigner.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const onMaxClick = async () => {
        if (selectedSide === Side.BUY) {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const price = ammPosition.sides[selectedSide].quote / (+amount || 1);

                if (price && paymentTokenBalance) {
                    let tmpSuggestedAmount = Number(paymentTokenBalance) / Number(price);
                    if (tmpSuggestedAmount > ammPosition.sides[selectedSide].available) {
                        setAmount(ammPosition.sides[selectedSide].available);
                        return;
                    }

                    const ammQuote = await fetchAmmQuote(tmpSuggestedAmount);

                    const ammPrice = Number(ethers.utils.formatEther(ammQuote)) / Number(tmpSuggestedAmount);
                    // 2 === slippage
                    tmpSuggestedAmount = (Number(paymentTokenBalance) / Number(ammPrice)) * ((100 - 2) / 100);
                    setAmount(Number(tmpSuggestedAmount.toFixed(2)));
                }
            }
        } else {
            //@ts-ignore
            setAmount(balances?.[Position[selectedPosition].toLowerCase()] || 0);
        }
    };

    return (
        <MarketContainer>
            <CollateralSelector
                collateralArray={COLLATERALS}
                selectedItem={selectedStableIndex}
                onChangeCollateral={(index) => setStableIndex(index)}
            />
            <Toggle
                margin="0 0 30px 0"
                label={{ firstLabel: Side.BUY, secondLabel: Side.SELL, fontSize: '18px' }}
                active={selectedSide === Side.SELL}
                dotSize="18px"
                dotBackground="#303656"
                dotBorder="3px solid #3FD1FF"
                handleClick={() => {
                    setSelectedSide(selectedSide === Side.BUY ? Side.SELL : Side.BUY);
                }}
            />
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchVSLabel>VS</MatchVSLabel>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                </MatchInfoColumn>
            </MatchInfo>
            <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
            <OddsContainer>
                <Pick selected={selectedPosition === Position.HOME} onClick={() => setSelectedPosition(Position.HOME)}>
                    <Option color="#50CE99">1</Option>
                    <OptionTeamName>{market.homeTeam.toUpperCase()}</OptionTeamName>
                    <InfoRow>
                        <InfoTitle>PRICE:</InfoTitle>
                        <InfoValue>$ {market.positions[Position.HOME].sides[selectedSide].odd.toFixed(2)}</InfoValue>
                    </InfoRow>
                </Pick>
                {!!market.positions[Position.DRAW].sides[selectedSide].odd && (
                    <Pick
                        selected={selectedPosition === Position.DRAW}
                        onClick={() => setSelectedPosition(Position.DRAW)}
                    >
                        <Option color="#40A1D8">X</Option>
                        <OptionTeamName>DRAW</OptionTeamName>
                        <InfoRow>
                            <InfoTitle>PRICE:</InfoTitle>
                            <InfoValue>
                                $ {market.positions[Position.DRAW].sides[selectedSide].odd.toFixed(2)}
                            </InfoValue>
                        </InfoRow>
                    </Pick>
                )}
                <Pick selected={selectedPosition === Position.AWAY} onClick={() => setSelectedPosition(Position.AWAY)}>
                    <Option color="#E26A78">2</Option>
                    <OptionTeamName>{market.awayTeam.toUpperCase()}</OptionTeamName>
                    <InfoRow>
                        <InfoTitle>PRICE:</InfoTitle>
                        <InfoValue>$ {market.positions[Position.AWAY].sides[selectedSide].odd.toFixed(2)}</InfoValue>
                    </InfoRow>
                </Pick>
            </OddsContainer>
            <SliderContainer>
                {!!amount && (
                    <AmountInfo>
                        <SliderInfo>
                            <SliderInfoTitle>Amount to {selectedSide.toLowerCase()}:</SliderInfoTitle>
                            <SliderInfoValue>
                                {positionPriceDetailsQuery.isLoading
                                    ? '-'
                                    : `${amount} = $${formatCurrency(ammPosition.sides[selectedSide].quote, 3, true)}`}
                            </SliderInfoValue>
                        </SliderInfo>
                    </AmountInfo>
                )}
                <Slider
                    type="range"
                    min={0}
                    max={ammPosition.sides[selectedSide].available}
                    value={amount || 0}
                    step={1}
                    onChange={(event) => {
                        setAmount(event.currentTarget.valueAsNumber);
                    }}
                />
                <SliderInfo>
                    <SliderInfoTitle>Available to {selectedSide.toLowerCase()}:</SliderInfoTitle>
                    <SliderInfoValue>
                        {positionPriceDetailsQuery.isLoading
                            ? '-'
                            : ammPosition.sides[selectedSide].available?.toFixed(2)}
                    </SliderInfoValue>
                </SliderInfo>
                <SliderInfo>
                    <SliderInfoTitle>Skew:</SliderInfoTitle>
                    <SliderInfoValue>
                        {positionPriceDetailsQuery.isLoading
                            ? '-'
                            : formatPercentage(ammPosition.sides[selectedSide].priceImpact)}
                    </SliderInfoValue>
                </SliderInfo>
            </SliderContainer>
            <FlexDivCentered>AMOUNT TO {selectedSide.toUpperCase()}:</FlexDivCentered>
            <FlexDivCentered>
                <AmountToBuyContainer>
                    <AmountToBuyInput type="number" onChange={(e) => setAmount(e.target.value)} value={amount} />
                    <MaxButton onClick={onMaxClick}>Max</MaxButton>
                </AmountToBuyContainer>
            </FlexDivCentered>
            <FlexDivCentered>
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
            </FlexDivCentered>
            <FlexDivCentered>
                <SubmitButton
                    disabled={!amount || isBuying || isAllowing}
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
        </MarketContainer>
    );
};

export default MarketDetails;

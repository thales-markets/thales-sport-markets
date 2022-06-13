import {
    MatchDate,
    MatchInfoColumn,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchVSLabel,
} from 'components/common';
import React, { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { MarketData } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource } from 'utils/images';
import { formatPercentage } from '../../../../utils/formatters/number';
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
} from './styled-components/MarketDetails';
import { FlexDivCentered } from '../../../../styles/common';
import { Position, Side } from '../../../../constants/options';
import Toggle from '../../../../components/Toggle/Toggle';
import networkConnector from '../../../../utils/networkConnector';
import { checkAllowance } from '../../../../utils/network';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from '../../../../redux/modules/wallet';
import ApprovalModal from '../../../../components/ApprovalModal/ApprovalModal';
import { PAYMENT_CURRENCY } from '../../../../constants/currency';
import { MAX_GAS_LIMIT } from '../../../../constants/network';

type MarketDetailsProps = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [amount, setAmount] = useState<number>(0);
    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const [selectedSide, setSelectedSide] = useState<Side>(Side.BUY);

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

    const fetchAmmQuote = async () => {
        if (!!amount) {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const parsedAmount = ethers.utils.parseEther(amount.toString());
                const ammQuote = await (selectedSide === Side.BUY
                    ? sportsAMMContractWithSigner?.buyFromAmmQuote(market.address, selectedPosition, parsedAmount)
                    : sportsAMMContractWithSigner?.sellToAmmQuote(market.address, selectedPosition, parsedAmount));
                console.log(ammQuote);
                return ammQuote;
            }
        }
    };

    const handleSubmit = async () => {
        if (!!amount) {
            const { sportsAMMContract, signer } = networkConnector;
            if (sportsAMMContract && signer) {
                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);
                const ammQuote = await fetchAmmQuote();
                const parsedAmount = ethers.utils.parseEther(amount.toString());

                console.log(market.address, selectedPosition, parsedAmount, ammQuote, ethers.utils.parseEther('0.02'));
                if (selectedSide === Side.BUY) {
                    await sportsAMMContractWithSigner?.buyFromAMM(
                        market.address,
                        selectedPosition,
                        parsedAmount,
                        ammQuote,
                        ethers.utils.parseEther('0.02'),
                        { gasLimit: 15000000 }
                    );
                } else {
                    await sportsAMMContractWithSigner?.sellToAMM(
                        market.address,
                        selectedPosition,
                        parsedAmount,
                        ammQuote,
                        ethers.utils.parseEther('0.02')
                    );
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

    return (
        <MarketContainer>
            <Toggle
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
                        <InfoTitle>ODDS:</InfoTitle>
                        <InfoValue>{market.positions[Position.HOME].sides[selectedSide].odd.toFixed(2)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>ROI:</InfoTitle>
                        <InfoValue>
                            {formatPercentage(1 / market.positions[Position.HOME].sides[selectedSide].odd)}
                        </InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>POOL SIZE:</InfoTitle>
                        <InfoValue>$20,000</InfoValue>
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
                            <InfoTitle>ODDS:</InfoTitle>
                            <InfoValue>{market.positions[Position.DRAW].sides[selectedSide].odd.toFixed(2)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>ROI:</InfoTitle>
                            <InfoValue>
                                {formatPercentage(
                                    market.positions[Position.DRAW].sides[selectedSide].odd
                                        ? 1 / market.positions[Position.DRAW].sides[selectedSide].odd
                                        : 0
                                )}
                            </InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>POOL SIZE:</InfoTitle>
                            <InfoValue>$20,000</InfoValue>
                        </InfoRow>
                    </Pick>
                )}
                <Pick selected={selectedPosition === Position.AWAY} onClick={() => setSelectedPosition(Position.AWAY)}>
                    <Option color="#E26A78">2</Option>
                    <OptionTeamName>{market.awayTeam.toUpperCase()}</OptionTeamName>
                    <InfoRow>
                        <InfoTitle>ODDS:</InfoTitle>
                        <InfoValue>{market.positions[Position.AWAY].sides[selectedSide].odd.toFixed(2)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>ROI:</InfoTitle>
                        <InfoValue>
                            {formatPercentage(1 / market.positions[Position.AWAY].sides[selectedSide].odd)}
                        </InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>POOL SIZE:</InfoTitle>
                        <InfoValue>$20,000</InfoValue>
                    </InfoRow>
                </Pick>
            </OddsContainer>
            <SliderContainer>
                <Slider
                    type="range"
                    min={100}
                    max={0}
                    value={1}
                    step={'0.1'}
                    // onChange={(event) => onChangeHandler(event)}
                    // disabled={disabled}
                    // onFocus={onFocus}
                    // onBlur={onBlur}
                />
                <SliderInfo>
                    <SliderInfoTitle>Available to buy:</SliderInfoTitle>
                    <SliderInfoValue>
                        {market.positions[selectedPosition].sides[selectedSide].available.toFixed(2)}
                    </SliderInfoValue>
                </SliderInfo>
                <SliderInfo>
                    <SliderInfoTitle>Skew:</SliderInfoTitle>
                    <SliderInfoValue>1%</SliderInfoValue>
                </SliderInfo>
            </SliderContainer>
            <FlexDivCentered>AMOUNT TO BUY:</FlexDivCentered>
            <FlexDivCentered>
                <AmountToBuyInput type="number" onChange={(e) => setAmount(+e.target.value)} />
            </FlexDivCentered>
            <FlexDivCentered>
                <SliderInfo>
                    <SliderInfoTitle>Potential profit:</SliderInfoTitle>
                    <SliderInfoValue>
                        ${((1 - market.positions[selectedPosition].sides[selectedSide].odd) * amount).toFixed(2)}
                    </SliderInfoValue>
                </SliderInfo>
            </FlexDivCentered>
            <FlexDivCentered>
                <SubmitButton
                    disabled={!amount}
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

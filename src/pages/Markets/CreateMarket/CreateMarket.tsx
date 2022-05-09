import DatetimePicker from 'components/fields/DatetimePicker';
import TextAreaInput from 'components/fields/TextAreaInput';
import Toggle from 'components/fields/Toggle';
import {
    DATE_PICKER_MAX_DATE,
    DATE_PICKER_MAX_LENGTH_MONTHS,
    DATE_PICKER_MIN_DATE,
    DEFAULT_POSITIONING_DURATION,
    MarketType,
    MAXIMUM_INPUT_CHARACTERS,
    MAXIMUM_POSITIONS,
    MAXIMUM_TAGS,
    MINIMUM_TICKET_PRICE,
    MAXIMUM_TICKET_PRICE,
} from 'constants/markets';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { Tag } from 'react-tag-autocomplete';
import TagsInput from 'components/fields/TagsInput';
import Description from './Description';
import { convertLocalToUTCDate, convertUTCToLocalDate, setDateTimeToUtcNoon } from 'utils/formatters/date';
import Positions from 'components/fields/Positions/Positions';
import Button from 'components/Button';
import useMarketsParametersQuery from 'queries/markets/useMarketsParametersQuery';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { MarketsParameters, Tags } from 'types/markets';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { BigNumber, ethers } from 'ethers';
import { MAX_GAS_LIMIT } from 'constants/network';
import onboardConnector from 'utils/onboardConnector';
import { DEFAULT_CURRENCY_DECIMALS, PAYMENT_CURRENCY } from 'constants/currency';
import usePaymentTokenBalanceQuery from 'queries/wallet/usePaymentTokenBalanceQuery';
import NumericInput from 'components/fields/NumericInput';
import ApprovalModal from 'components/ApprovalModal';
import useTagsQuery from 'queries/markets/useTagsQuery';
import { buildHref, buildMarketLink, navigateTo } from 'utils/routes';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { endOfToday, isSameDay, setMonth, startOfToday } from 'date-fns';
import WarningMessage from 'components/WarningMessage';
import { BondInfo } from 'components/common';
import BackToLink from '../components/BackToLink';
import ROUTES from 'constants/routes';
import RadioButton from 'components/fields/RadioButton';
import { FieldLabel, OverlayContainer } from 'components/fields/common';
import Tooltip from 'components/Tooltip';
import CreateMarketModal from './CreateMarketModal';
import { isValidHttpsUrl } from 'utils/markets';

const calculateMinTime = (currentDate: Date, minDate: Date) => {
    const isMinDateCurrentDate = isSameDay(currentDate, minDate);
    if (isMinDateCurrentDate) {
        return minDate;
    }
    return startOfToday();
};

const calculateMaxTime = (currentDate: Date, maxDate: Date) => {
    const isMaxDateCurrentDate = isSameDay(currentDate, maxDate);
    if (isMaxDateCurrentDate) {
        return maxDate;
    }
    return endOfToday();
};

const CreateMarket: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [question, setQuestion] = useState<string>('');
    const [dataSource, setDataSource] = useState<string>('');
    const [marketType, setMarketType] = useState<MarketType>(MarketType.TICKET);
    const [ticketPrice, setTicketPrice] = useState<number | string>('');
    const [isWithdrawalAllowed, setIsWithdrawalAllowed] = useState<boolean>(true);
    const [positions, setPositions] = useState<string[]>(new Array(2).fill(''));
    const [endOfPositioning, setEndOfPositioning] = useState<Date>(
        setDateTimeToUtcNoon(new Date(DATE_PICKER_MIN_DATE.getTime() + DEFAULT_POSITIONING_DURATION))
    );
    const [tags, setTags] = useState<Tag[]>([]);
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [openCreateMarketModal, setOpenCreateMarketModal] = useState<boolean>(false);
    const [minTime, setMinTime] = useState<Date>(DATE_PICKER_MIN_DATE);
    const [minDate, setMinDate] = useState<Date>(DATE_PICKER_MIN_DATE);
    const [maxTime, setMaxTime] = useState<Date>(DATE_PICKER_MAX_DATE);
    const [maxDate, setMaxDate] = useState<Date>(DATE_PICKER_MAX_DATE);
    const [isTicketPriceValid, setIsTicketPriceValid] = useState<boolean>(true);
    const [initialPosition, setInitialPosition] = useState<number>(0);
    const [marketsParameters, setMarketsParameters] = useState<MarketsParameters | undefined>(undefined);

    const marketsParametersQuery = useMarketsParametersQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (marketsParametersQuery.isSuccess && marketsParametersQuery.data) {
            setMarketsParameters(marketsParametersQuery.data);
        }
    }, [marketsParametersQuery.isSuccess, marketsParametersQuery.data]);

    const minimumPositioningDuration = marketsParameters ? marketsParameters.minimumPositioningDuration : 0;

    useEffect(() => {
        const minDate = convertUTCToLocalDate(new Date((Date.now() / 1000 + minimumPositioningDuration) * 1000));
        const minTime = calculateMinTime(endOfPositioning, minDate);
        setMinTime(minTime);
        setMinDate(minDate);

        const maxDate = setMonth(minDate, minDate.getMonth() + DATE_PICKER_MAX_LENGTH_MONTHS);
        const maxTime = calculateMaxTime(endOfPositioning, maxDate);
        setMaxTime(maxTime);
        setMaxDate(maxDate);
    }, [minimumPositioningDuration]);

    const tagsQuery = useTagsQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (tagsQuery.isSuccess && tagsQuery.data) {
            const availableTags = tagsQuery.data as Tags;
            setSuggestions(
                availableTags.map((tag) => ({
                    id: tag.id,
                    name: tag.label,
                    disabled: false,
                }))
            );
        }
    }, [tagsQuery.isSuccess, tagsQuery.data]);

    const paymentTokenBalanceQuery = usePaymentTokenBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const fixedBondAmount = marketsParameters ? marketsParameters.fixedBondAmount : 0;
    const creationRestrictedToOwner = marketsParameters
        ? marketsParameters.creationRestrictedToOwner && marketsParameters.owner !== walletAddress
        : false;
    const maxNumberOfTags = marketsParameters ? marketsParameters.maxNumberOfTags : MAXIMUM_TAGS;
    const maximumPositionsAllowed = marketsParameters ? marketsParameters.maximumPositionsAllowed : MAXIMUM_POSITIONS;
    const minFixedTicketPrice = marketsParameters ? marketsParameters.minFixedTicketPrice : MINIMUM_TICKET_PRICE;
    const maxFixedTicketPrice = marketsParameters ? marketsParameters.maxFixedTicketPrice : MAXIMUM_TICKET_PRICE;

    const creatorPercentage = marketsParameters ? marketsParameters.creatorPercentage : 0;
    const withdrawalPercentage = marketsParameters ? marketsParameters.withdrawalPercentage : 0;

    const marketQuestionStringLimit = marketsParameters
        ? marketsParameters.marketQuestionStringLimit
        : MAXIMUM_INPUT_CHARACTERS;
    const marketSourceStringLimit = marketsParameters
        ? marketsParameters.marketSourceStringLimit
        : MAXIMUM_INPUT_CHARACTERS;
    const marketPositionStringLimit = marketsParameters
        ? marketsParameters.marketPositionStringLimit
        : MAXIMUM_INPUT_CHARACTERS;

    const isQuestionEntered = question.trim() !== '';
    const isDataSourceEntered = dataSource.trim() !== '';
    const isDataSourceValid = dataSource.trim() === '' || isValidHttpsUrl(dataSource);
    const isTicketPriceEntered =
        (marketType === MarketType.TICKET && Number(ticketPrice) > 0) || marketType === MarketType.OPEN_BID;
    const arePositionsEntered = positions.every((position) => position.trim() !== '');
    const areTagsEntered = tags.length > 0;
    const isInitialPositionSelected = initialPosition > 0;

    const requiredFunds =
        marketType === MarketType.TICKET ? Number(fixedBondAmount) + Number(ticketPrice) : Number(fixedBondAmount);
    const insufficientBalance = Number(paymentTokenBalance) < requiredFunds || Number(paymentTokenBalance) === 0;

    const areMarketDataEntered =
        isQuestionEntered &&
        isDataSourceEntered &&
        isTicketPriceEntered &&
        arePositionsEntered &&
        areTagsEntered &&
        isInitialPositionSelected;

    const isButtonDisabled =
        isSubmitting ||
        !isWalletConnected ||
        !hasAllowance ||
        !areMarketDataEntered ||
        insufficientBalance ||
        creationRestrictedToOwner ||
        !isTicketPriceValid ||
        !isDataSourceValid;

    useEffect(() => {
        const { paymentTokenContract, thalesBondsContract, signer } = networkConnector;
        if (paymentTokenContract && thalesBondsContract && signer) {
            const paymentTokenContractWithSigner = paymentTokenContract.connect(signer);
            const addressToApprove = thalesBondsContract.address;
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseEther(Number(requiredFunds).toString());
                    const allowance = await checkAllowance(
                        parsedAmount,
                        paymentTokenContractWithSigner,
                        walletAddress,
                        addressToApprove
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
    }, [walletAddress, isWalletConnected, hasAllowance, requiredFunds, isAllowing]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { paymentTokenContract, thalesBondsContract, signer } = networkConnector;
        if (paymentTokenContract && thalesBondsContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsAllowing(true);

            try {
                const paymentTokenContractWithSigner = paymentTokenContract.connect(signer);
                const addressToApprove = thalesBondsContract.address;

                const tx = (await paymentTokenContractWithSigner.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-messsage.approve-success', { token: PAYMENT_CURRENCY }))
                    );
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsAllowing(false);
            }
        }
    };

    const handleSubmit = async () => {
        const { marketManagerContract, signer } = networkConnector;
        if (marketManagerContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);

            try {
                const marketManagerContractWithSigner = marketManagerContract.connect(signer);

                const formattedEndOfPositioning = Math.round((endOfPositioning as Date).getTime() / 1000);
                const parsedTicketPrice = ethers.utils.parseEther(
                    (marketType === MarketType.TICKET ? ticketPrice : 0).toString()
                );
                const formmatedTags = tags.map((tag) => tag.id);

                const tx = await marketManagerContractWithSigner.createExoticMarket(
                    question,
                    dataSource,
                    formattedEndOfPositioning,
                    parsedTicketPrice,
                    isWithdrawalAllowed,
                    formmatedTags,
                    positions.length,
                    initialPosition,
                    positions
                );
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.create-market-success')));
                    setIsSubmitting(false);
                    const rawData = txResult.events[txResult.events.length - 1];
                    if (rawData && rawData.decode) {
                        const marketData = rawData.decode(rawData.data);
                        navigateTo(buildMarketLink(marketData.marketAddress, true));
                    }
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const getEnterMarketDataMessage = () => {
        if (!isQuestionEntered) {
            return t(`common.errors.enter-question`);
        }
        if (!isDataSourceEntered) {
            return t(`common.errors.enter-data-source`);
        }
        if (!arePositionsEntered) {
            return t(`common.errors.enter-positions`);
        }
        if (marketType === MarketType.TICKET && !isTicketPriceEntered) {
            return t(`common.errors.enter-ticket-price`);
        }
        if (!areTagsEntered) {
            return t(`common.errors.enter-tags`);
        }
        if (!isInitialPositionSelected) {
            return t(`common.errors.select-initial-position`);
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <CreateMarketButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </CreateMarketButton>
            );
        }
        if (creationRestrictedToOwner) {
            return (
                <CreateMarketButton disabled={true}>
                    {t(`market.create-market.button.create-market-label`)}
                </CreateMarketButton>
            );
        }
        if (insufficientBalance) {
            return <CreateMarketButton disabled={true}>{t(`common.errors.insufficient-balance`)}</CreateMarketButton>;
        }
        if (!isTicketPriceValid) {
            return <CreateMarketButton disabled={true}>{t(`common.errors.invalid-ticket-price`)}</CreateMarketButton>;
        }
        if (!areMarketDataEntered) {
            return <CreateMarketButton disabled={true}>{getEnterMarketDataMessage()}</CreateMarketButton>;
        }
        if (!isDataSourceValid) {
            return <CreateMarketButton disabled={true}>{t(`common.errors.invalid-data-source`)}</CreateMarketButton>;
        }
        if (!hasAllowance) {
            return (
                <CreateMarketButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: PAYMENT_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: PAYMENT_CURRENCY,
                          })}
                </CreateMarketButton>
            );
        }
        return (
            <CreateMarketButton disabled={isButtonDisabled} onClick={() => setOpenCreateMarketModal(true)}>
                {!isSubmitting
                    ? t('market.create-market.button.create-market-label')
                    : t('market.create-market.button.create-market-progress-label')}
            </CreateMarketButton>
        );
    };

    const addPosition = () => {
        setPositions([...positions, '']);
        setInitialPosition(0);
    };

    const removePosition = (index: number) => {
        const newPostions = [...positions];
        newPostions.splice(index, 1);
        setPositions(newPostions);
        setInitialPosition(0);
    };

    const setPositionText = (index: number, text: string) => {
        const newPostions = [...positions];
        newPostions[index] = text;
        setPositions(newPostions);
        setInitialPosition(0);
    };

    const addTag = (tag: Tag) => {
        const tagIndex = tags.findIndex((tagItem: Tag) => tag.id === tagItem.id);
        if (tagIndex === -1 && tags.length < maxNumberOfTags) {
            const suggestionsTagIndex = suggestions.findIndex((tagItem: Tag) => tag.id === tagItem.id);
            const newSuggestions = [...suggestions];
            newSuggestions[suggestionsTagIndex].disabled = true;
            setSuggestions(suggestions);

            setTags([...tags, tag]);
        }
    };

    const removeTag = (index: number) => {
        const tagId = tags[index].id;
        const tagIndex = suggestions.findIndex((tagItem: Tag) => tagId === tagItem.id);
        const newSuggestions = [...suggestions];
        newSuggestions[tagIndex].disabled = false;
        setSuggestions(suggestions);

        const newTags = [...tags];
        newTags.splice(index, 1);
        setTags(newTags);
    };

    const handleEndOfPositioningChange = (date: Date) => {
        setEndOfPositioning(convertLocalToUTCDate(minDate > date ? minDate : maxDate < date ? maxDate : date));
        const minTime = calculateMinTime(date, minDate);
        setMinTime(minTime);
        const maxTime = calculateMaxTime(date, maxDate);
        setMaxTime(maxTime);
    };

    useEffect(() => {
        setIsTicketPriceValid(
            (marketType === MarketType.TICKET && Number(ticketPrice) === 0) ||
                (Number(ticketPrice) > 0 &&
                    Number(ticketPrice) >= minFixedTicketPrice &&
                    Number(ticketPrice) <= maxFixedTicketPrice) ||
                marketType === MarketType.OPEN_BID
        );
    }, [ticketPrice, marketType]);

    return (
        <Container>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <ContentWrapper>
                <Form>
                    {creationRestrictedToOwner && (
                        <WarningMessage marginBottom={20}>
                            {t('market.create-market.creation-disabled-message')}
                        </WarningMessage>
                    )}
                    <TextAreaInput
                        value={question}
                        onChange={setQuestion}
                        label={t('market.create-market.question-label')}
                        tooltip={t('market.create-market.question-tooltip')}
                        note={t('common.input-characters-note', {
                            entered: question.length,
                            max: marketQuestionStringLimit,
                        })}
                        maximumCharacters={marketQuestionStringLimit}
                        disabled={isSubmitting || creationRestrictedToOwner}
                    />
                    <TextAreaInput
                        value={dataSource}
                        onChange={setDataSource}
                        label={t('market.create-market.data-source-label')}
                        tooltip={t('market.create-market.data-source-tooltip')}
                        note={t('common.input-characters-note', {
                            entered: dataSource.length,
                            max: marketSourceStringLimit,
                        })}
                        maximumCharacters={marketSourceStringLimit}
                        disabled={isSubmitting || creationRestrictedToOwner}
                        showValidation={!isDataSourceValid}
                        validationMessage={t(`common.errors.invalid-data-source-extended`)}
                    />
                    <Positions
                        positions={positions}
                        onPositionAdd={addPosition}
                        onPositionRemove={removePosition}
                        onPositionChange={setPositionText}
                        label={t('market.create-market.positions-label')}
                        tooltip={t('market.create-market.positions-tooltip', { max: maximumPositionsAllowed })}
                        disabled={isSubmitting || creationRestrictedToOwner}
                        maxPositions={maximumPositionsAllowed}
                        maximumCharacters={marketPositionStringLimit}
                    />
                    <DatetimePicker
                        selected={convertUTCToLocalDate(endOfPositioning)}
                        onChange={handleEndOfPositioningChange}
                        label={t('market.create-market.positioning-end-label')}
                        tooltip={t('market.create-market.positioning-end-tooltip', {
                            min: formatCurrency(minimumPositioningDuration / 60 / 60, DEFAULT_CURRENCY_DECIMALS, true),
                            max: DATE_PICKER_MAX_LENGTH_MONTHS,
                        })}
                        disabled={isSubmitting || creationRestrictedToOwner}
                        minTime={minTime}
                        maxTime={maxTime}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                    <Toggle
                        isLeftOptionSelected={marketType === MarketType.TICKET}
                        onClick={() => {
                            setMarketType(marketType === MarketType.TICKET ? MarketType.OPEN_BID : MarketType.TICKET);
                        }}
                        label={t('market.create-market.type-label')}
                        leftText={t('market.create-market.type-options.ticket')}
                        rightText={t('market.create-market.type-options.open-bid')}
                        toggleTooltip={t('market.create-market.type-toggle-tooltip')}
                        tooltip={t('market.create-market.type-tooltip')}
                        // disabled={isSubmitting || creationRestrictedToOwner}
                        disabled={true}
                    />
                    {marketType === MarketType.TICKET && (
                        <NumericInput
                            value={ticketPrice}
                            onChange={(_, value) => setTicketPrice(value)}
                            label={t('market.create-market.ticket-price-label')}
                            tooltip={t('market.create-market.ticket-price-tooltip')}
                            currencyLabel={PAYMENT_CURRENCY}
                            disabled={isSubmitting || creationRestrictedToOwner}
                            showValidation={!isTicketPriceValid}
                            validationMessage={t(`common.errors.invalid-ticket-price-extended`, {
                                min: formatCurrencyWithKey(
                                    PAYMENT_CURRENCY,
                                    minFixedTicketPrice,
                                    DEFAULT_CURRENCY_DECIMALS,
                                    true
                                ),
                                max: formatCurrencyWithKey(
                                    PAYMENT_CURRENCY,
                                    maxFixedTicketPrice,
                                    DEFAULT_CURRENCY_DECIMALS,
                                    true
                                ),
                            })}
                        />
                    )}
                    <Toggle
                        isLeftOptionSelected={isWithdrawalAllowed}
                        onClick={() => {
                            setIsWithdrawalAllowed(!isWithdrawalAllowed);
                        }}
                        label={t('market.create-market.withdraw-label')}
                        tooltip={t('market.create-market.withdraw-tooltip', {
                            withdrawalPercentage: withdrawalPercentage / 2,
                        })}
                        leftText={t('market.create-market.withdraw-options.enabled')}
                        rightText={t('market.create-market.withdraw-options.disabled')}
                        disabled={isSubmitting || creationRestrictedToOwner}
                    />
                    <TagsInput
                        tags={tags}
                        suggestions={suggestions}
                        onTagAdd={addTag}
                        onTagRemove={removeTag}
                        label={t('market.create-market.tags-label', { max: maxNumberOfTags })}
                        tooltip={t('market.create-market.tags-tooltip', { max: maxNumberOfTags })}
                        disabled={isSubmitting || creationRestrictedToOwner}
                        maxTags={maxNumberOfTags}
                    />
                    <YourPostionsContainer>
                        <FieldLabel>
                            {t('market.create-market.your-initial-position-label')}
                            <Tooltip
                                overlay={
                                    <OverlayContainer>
                                        {t('market.create-market.your-initial-position-tooltip')}
                                    </OverlayContainer>
                                }
                                iconFontSize={23}
                                marginLeft={2}
                                top={0}
                            />
                        </FieldLabel>
                        <YourPostions>
                            {positions.map((position: string, index: number) => {
                                const positionIndex = index + 1;
                                return (
                                    <RadioButton
                                        checked={positionIndex === initialPosition}
                                        value={positionIndex}
                                        onChange={() => setInitialPosition(positionIndex)}
                                        label={position.trim() === '' ? '...' : position}
                                        disabled={isSubmitting || creationRestrictedToOwner}
                                        key={`yourPositionKey${position}${index}`}
                                    />
                                );
                            })}
                        </YourPostions>
                    </YourPostionsContainer>
                    <ButtonContainer>
                        <BondInfo>
                            <Trans
                                i18nKey={'market.create-market.bond-info'}
                                components={[
                                    <ul key="1">
                                        <li key="0" />
                                    </ul>,
                                ]}
                                values={{
                                    amount: formatCurrencyWithKey(
                                        PAYMENT_CURRENCY,
                                        fixedBondAmount,
                                        DEFAULT_CURRENCY_DECIMALS,
                                        true
                                    ),
                                    bidPercentage: creatorPercentage,
                                    withdrawalPercentage: withdrawalPercentage / 2,
                                }}
                            />
                        </BondInfo>
                        {getSubmitButton()}
                    </ButtonContainer>
                </Form>
                <Description />
            </ContentWrapper>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={requiredFunds}
                    tokenSymbol={PAYMENT_CURRENCY}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
            {openCreateMarketModal && (
                <CreateMarketModal
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onClose={() => setOpenCreateMarketModal(false)}
                    fixedBondAmount={fixedBondAmount}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    align-items: center;
    @media (max-width: 767px) {
        width: 100%;
    }
`;

const ContentWrapper = styled(FlexDivRow)`
    margin-top: 20px;
    @media (max-width: 767px) {
        flex-direction: column;
        width: 100%;
    }
`;

const Form = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 25px;
    padding: 20px 20px 50px 20px;
    height: fit-content;
`;

const YourPostionsContainer = styled(FlexDivColumn)`
    border-top: 2px solid ${(props) => props.theme.borderColor.primary};
    padding-top: 10px;
`;

const YourPostions = styled(FlexDivColumn)`
    label {
        align-self: start;
    }
`;

const CreateMarketButton = styled(Button)``;

const ButtonContainer = styled(FlexDivColumn)`
    margin: 40px 0 0 0;
    align-items: center;
`;

export default CreateMarket;

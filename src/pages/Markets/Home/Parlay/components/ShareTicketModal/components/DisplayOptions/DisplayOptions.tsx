import Button from 'components/Button';
import Toggle from 'components/Toggle/Toggle';
import { t } from 'i18next';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

export type DisplayOptionsType = {
    isSimpleView: boolean;
    showUsdAmount: boolean;
    showPercentage: boolean;
    showTimestamp: boolean;
};

type DisplayOptionsProps = {
    setDisplayOptions: (options: DisplayOptionsType) => void;
    onShare: () => void;
    isDisabled: boolean;
};

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ setDisplayOptions, isDisabled, onShare }) => {
    const [isSimpleView, setIsSimpleView] = useState(false);
    const [showUsdAmount, setShowUsdAmount] = useState(true);
    const [showPercentage, setShowPercentage] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(true);

    const onOptionToggleViewClickHandler = () => {
        const newIsSimpleView = !isSimpleView;
        setIsSimpleView(newIsSimpleView);
        setDisplayOptions({ isSimpleView: newIsSimpleView, showUsdAmount, showPercentage, showTimestamp });
    };

    const onOptionUsdAmountClickHandler = () => {
        const newShowUsdAmount = !showUsdAmount;
        setShowUsdAmount(newShowUsdAmount);
        setDisplayOptions({ isSimpleView, showUsdAmount: newShowUsdAmount, showPercentage, showTimestamp });
    };

    const onOptionPercentageClickHandler = () => {
        const newShowPercentage = !showPercentage;
        setShowPercentage(newShowPercentage);
        setDisplayOptions({ isSimpleView, showUsdAmount, showPercentage: newShowPercentage, showTimestamp });
    };

    const onOptionTimestampClickHandler = () => {
        const newShowTimestamp = !showTimestamp;
        setShowTimestamp(newShowTimestamp);
        setDisplayOptions({ isSimpleView, showUsdAmount, showPercentage, showTimestamp: newShowTimestamp });
    };

    const onShareClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.currentTarget.disabled = true;
        onShare();
    };

    return (
        <Container
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Title>{t('markets.parlay.share-ticket.options.title')}</Title>
            <Toggle
                label={{
                    firstLabel: t('markets.parlay.share-ticket.options.view-details'),
                    secondLabel: t('markets.parlay.share-ticket.options.view-simple'),
                    fontSize: '18px',
                    fontWeight: '500',
                    lineHeight: '36px',
                }}
                active={isSimpleView}
                disabled={isDisabled}
                dotSize="18px"
                dotBackground="#ffffff"
                handleClick={onOptionToggleViewClickHandler}
            />
            <Option>
                <OptionLabel disabled={isDisabled}>{t('markets.parlay.share-ticket.options.usd-amount')}</OptionLabel>
                <OptionSymbol
                    className={`icon ${showUsdAmount ? 'icon--correct' : 'icon--hide'}`}
                    disabled={isDisabled}
                    onClick={onOptionUsdAmountClickHandler}
                />
            </Option>
            <Option>
                <OptionLabel disabled={isDisabled}>{t('markets.parlay.share-ticket.options.percentage')}</OptionLabel>
                <OptionSymbol
                    className={`icon ${showPercentage ? 'icon--correct' : 'icon--hide'}`}
                    disabled={isDisabled}
                    onClick={onOptionPercentageClickHandler}
                />
            </Option>
            <Option>
                <OptionLabel disabled={isDisabled}>{t('markets.parlay.share-ticket.options.timestamp')}</OptionLabel>
                <OptionSymbol
                    className={`icon ${showTimestamp ? 'icon--correct' : 'icon--hide'}`}
                    disabled={isDisabled}
                    onClick={onOptionTimestampClickHandler}
                />
            </Option>
            <Option>
                <ShareButton disabled={isDisabled} onClick={onShareClickHandler}>
                    {t('markets.parlay.share-ticket.share')}
                </ShareButton>
            </Option>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    position: absolute;
    align-items: center;
    bottom: 35px;
    right: 35px;
    width: 243px;
    height: 280px;
    padding: 15px;
    background: linear-gradient(180deg, #5f6180 0%, #2f303f 100%);
    border-radius: 8px;
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
`;

const Title = styled.span`
    padding-bottom: 10px;
`;

const Option = styled(FlexDivRowCentered)`
    width: 100%;
    padding: 0 5px;
`;

const OptionLabel = styled.span<{ disabled?: boolean }>`
    font-weight: 500;
    line-height: 36px;
    opacity: ${(props: any) => (props.disabled ? '0.4' : '1')};
`;

const OptionSymbol = styled.i<{ disabled?: boolean }>`
    font-size: 18px;
    font-weight: 500;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props: any) => (props.disabled ? '0.4' : '1')};
`;

const ShareButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
    background: #3fd1ff;
    color: black;
    height: 34px;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 20px;
    line-height: 23px;
`;

export default DisplayOptions;

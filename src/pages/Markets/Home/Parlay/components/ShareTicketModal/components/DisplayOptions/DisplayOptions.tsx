import Button from 'components/Button';
import Toggle from 'components/Toggle/Toggle';
import { t } from 'i18next';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

export type DisplayOptionsType = {
    isSimpleView: boolean;
};

type DisplayOptionsProps = {
    setDisplayOptions: (options: DisplayOptionsType) => void;
    onShare: () => void;
    isDisabled: boolean;
};

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ setDisplayOptions, isDisabled, onShare }) => {
    const [isSimpleView, setIsSimpleView] = useState(false);

    const onOptionToggleViewClickHandler = () => {
        const newIsSimpleView = !isSimpleView;
        setIsSimpleView(newIsSimpleView);
        setDisplayOptions({ isSimpleView: newIsSimpleView });
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
    height: 155px;
    padding: 15px;
    background: linear-gradient(180deg, #5f6180 0%, #2f303f 100%);
    border-radius: 8px;
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
    @media (max-width: 950px) {
        top: 10px;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        height: 90px;
        padding: 10px;
    }
`;

const Title = styled.span`
    padding-bottom: 10px;
`;

const Option = styled(FlexDivRowCentered)`
    width: 100%;
    padding: 0 5px;
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
    @media (max-width: 950px) {
        display: none;
`;

export default DisplayOptions;

import Button from 'components/Button';
import Toggle from 'components/Toggle/Toggle';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { TwitterIcon } from '../../../styled-components';
import { ThemeInterface } from 'types/ui';

export type DisplayOptionsType = {
    isSimpleView: boolean;
};

type DisplayOptionsProps = {
    defaultDisplayOptions: DisplayOptionsType;
    setDisplayOptions: (options: DisplayOptionsType) => void;
    onShare: () => void;
    isDisabled: boolean;
};

const DisplayOptions: React.FC<DisplayOptionsProps> = ({
    defaultDisplayOptions,
    setDisplayOptions,
    isDisabled,
    onShare,
}) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const theme: ThemeInterface = useTheme();

    const [isSimpleView, setIsSimpleView] = useState(defaultDisplayOptions.isSimpleView);

    const onOptionToggleViewClickHandler = () => {
        const newIsSimpleView = !isSimpleView;
        setIsSimpleView(newIsSimpleView);
        setDisplayOptions({ isSimpleView: newIsSimpleView });
    };

    const onShareClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.currentTarget.disabled = true;
        onShare();
        event.currentTarget.disabled = false;
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
                <Button
                    disabled={isDisabled}
                    onClick={onShareClickHandler}
                    backgroundColor={
                        isMobile
                            ? 'linear-gradient(88.08deg, #3ca8ca 0.6%, #1748b1 101.56%)'
                            : theme.button.background.quaternary
                    }
                    borderColor={isMobile ? 'transparent' : theme.button.borderColor.secondary}
                    textColor={isMobile ? theme.button.textColor.secondary : theme.button.textColor.primary}
                    width="100%"
                    margin={isMobile ? '10px 0 0 0' : '20px 0 0 0'}
                    fontSize="20px"
                    padding={isMobile ? '0px 30px' : '3px 30px'}
                    additionalStyles={isMobile ? additionalMobileButtonStyle : undefined}
                >
                    {t('markets.parlay.share-ticket.share')}
                    {isMobile && <TwitterIcon disabled={isDisabled} fontSize={'27px'} padding={'0 0 0 10px'} />}
                </Button>
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
        width: 100%;
        bottom: -132px;
        left: 0;
        height: 127px;
        padding: 10px;
    }
`;

const Title = styled.span`
    padding-bottom: 10px;
    @media (max-width: 950px) {
        padding-bottom: 2px;
    }
`;

const Option = styled(FlexDivRowCentered)`
    width: 100%;
    padding: 0 5px;
`;

const additionalMobileButtonStyle: CSSProperties = {
    border: 'none',
};

export default DisplayOptions;

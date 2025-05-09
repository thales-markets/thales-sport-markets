import Tooltip from 'components/Tooltip';
import Checkbox from 'components/fields/Checkbox';
import NumericInput from 'components/fields/NumericInput';
import { DEFAULT_SLIPPAGE_PERCENTAGE } from 'constants/markets';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { countDecimals } from 'thales-utils';
import { ThemeInterface } from 'types/ui';

type SlippageProps = {
    fixed: Array<number>;
    defaultValue: number;
    onChangeHandler?: (value: number) => void;
    maxValue?: number;
    tooltip?: string;
};

const MIN_VALUE = 0;
const MAX_VALUE = 100;

const isSlippageValid = (value: number, max?: number) => {
    return value >= MIN_VALUE && value <= (max || MAX_VALUE);
};

const Slippage: React.FC<SlippageProps> = ({ fixed, defaultValue, onChangeHandler, maxValue, tooltip }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [acceptAnyOdds, setAcceptAnyOdds] = useState(defaultValue === MAX_VALUE);
    const [slippage, setSlippage] = useState<number | string>(defaultValue || '');
    const [slippageEnabled, setSlippageEnabled] = useState<boolean>(![MIN_VALUE, MAX_VALUE].includes(defaultValue));

    const max = maxValue || MAX_VALUE;

    useEffect(() => {
        onChangeHandler && onChangeHandler(Number(slippage));
    }, [slippage, onChangeHandler]);

    const onInputValueChange = (value: number | string) => {
        const numValue = Number(value);
        if (countDecimals(numValue) > 2) {
            return;
        }

        if (numValue >= MIN_VALUE && numValue <= max) {
            setSlippage(value);
        } else if (numValue < MIN_VALUE) {
            setSlippage(MIN_VALUE);
        } else if (numValue > max) {
            setSlippage(max);
        }
    };

    return (
        <Container>
            <Text>
                <Checkbox
                    className="small-checkbox"
                    value="acceptAnyOdds"
                    checked={acceptAnyOdds}
                    onChange={(e: any) => {
                        setAcceptAnyOdds(!acceptAnyOdds);
                        setSlippageEnabled(false);
                        setSlippage(e.target.checked ? MAX_VALUE : MIN_VALUE);
                    }}
                />
                {t('markets.parlay.slippage.any-odds-label')}
            </Text>
            <Text>
                <Checkbox
                    className="small-checkbox"
                    value="slippage"
                    checked={slippageEnabled}
                    onChange={(e: any) => {
                        setAcceptAnyOdds(false);
                        setSlippageEnabled(!slippageEnabled);
                        setSlippage(e.target.checked ? DEFAULT_SLIPPAGE_PERCENTAGE : MIN_VALUE);
                    }}
                />
                {t('markets.parlay.slippage.label')}
                {tooltip && (
                    <Tooltip
                        customIconStyling={{ marginLeft: '2px', marginTop: '1px' }}
                        overlay={tooltip}
                        iconFontSize={14}
                    />
                )}
            </Text>
            <Row>
                {fixed.length && (
                    <FlexDivRowCentered>
                        {fixed.map((value, index) => (
                            <Value
                                disabled={!slippageEnabled}
                                key={index}
                                isSelected={value === slippage}
                                onClick={() => {
                                    slippageEnabled && setSlippage(value);
                                }}
                            >
                                <Text isSelected={value === slippage}>{value}%</Text>
                            </Value>
                        ))}
                    </FlexDivRowCentered>
                )}
                <NumericInput
                    disabled={!slippageEnabled}
                    value={slippage}
                    placeholder={t('markets.parlay.slippage.enter-value')}
                    onChange={(_, value) => onInputValueChange(value)}
                    currencyLabel="%"
                    showValidation={slippage !== '' && !isSlippageValid(Number(slippage), max)}
                    validationMessage={t('markets.parlay.slippage.invalid-value')}
                    margin="0px"
                    inputPadding="5px 10px"
                    inputFontSize="13px"
                    width="70px"
                    borderColor={theme.input.borderColor.tertiary}
                />
            </Row>
        </Container>
    );
};

const HEIGHT = '30px';

const Container = styled(FlexDivColumnCentered)`
    gap: 10px;
`;

const Row = styled(FlexDivRowCentered)`
    width: 100%;
`;

const Value = styled(FlexDivColumnCentered)<{ isSelected: boolean; disabled?: boolean }>`
    width: 45px;
    height: ${HEIGHT};
    color: ${(props) =>
        props.isSelected ? props.theme.button.textColor.quinary : props.theme.button.textColor.secondary};
    background-color: ${(props) =>
        props.isSelected ? props.theme.button.background.quaternary : props.theme.button.background.senary};
    border-radius: 8px;
    align-items: center;
    margin-right: 10px;
    cursor: pointer;
    padding: 2px 10px;
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const Text = styled.span<{ isSelected?: boolean }>`
    display: flex;
    font-style: normal;
    font-weight: ${(props) => (props.isSelected ? 'bold' : 'normal')};
    font-size: 13px;
    line-height: 15px;
    color: ${(props) => (props.isSelected ? props.theme.background.primary : props.theme.textColor.primary)};
    i {
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default Slippage;

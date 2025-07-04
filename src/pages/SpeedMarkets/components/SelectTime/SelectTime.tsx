import SelectInput from 'components/SelectInput';
import { DELTA_TIMES_MINUTES } from 'constants/speedMarkets';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { minutesToSeconds } from 'date-fns';
import { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { components } from 'react-select';
import styled, { useTheme } from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';

type SelectTimeProps = {
    deltaTimeSec: number;
    setDeltaTimeSec: Dispatch<number>;
};

const SingleValue = (props: any) => {
    return (
        components.SingleValue && (
            <components.SingleValue {...props}>
                <FlexDivRowCentered>
                    <TimeIcon className="speedmarkets-icon speedmarkets-icon--clock" />
                    <SingleValueText>{props.data.label}</SingleValueText>
                </FlexDivRowCentered>
            </components.SingleValue>
        )
    );
};

const DropdownIndicator = (props: any) => {
    return (
        components.DropdownIndicator && (
            <components.DropdownIndicator {...props}>
                <DownIcon className="speedmarkets-icon speedmarkets-icon--indicator-down" />
            </components.DropdownIndicator>
        )
    );
};

const SelectTime: React.FC<SelectTimeProps> = ({ deltaTimeSec, setDeltaTimeSec }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const deltaTimesLabels = DELTA_TIMES_MINUTES.map((deltaTime) =>
        `${deltaTime} ${deltaTime === 1 ? t('common.time-remaining.minute') : t('common.time-remaining.minutes')} ${t(
            'common.trades'
        )}`.toUpperCase()
    );

    const options = DELTA_TIMES_MINUTES.map((deltaTime, i) => ({
        value: deltaTime,
        label: deltaTimesLabels[i],
    }));

    return (
        <SelectInput
            options={options}
            value={options.find((option) => minutesToSeconds(option.value) === deltaTimeSec)}
            handleChange={(value: any) => setDeltaTimeSec(minutesToSeconds(Number(value)))}
            width={180}
            components={{
                IndicatorSeparator: () => null,
                DropdownIndicator,
                SingleValue,
            }}
            style={{
                containerStyle: { height: '26px', zIndex: SPEED_MARKETS_WIDGET_Z_INDEX },
                controlStyle: {
                    minHeight: 'unset',
                    borderRadius: '9999px',
                    border: `1px solid ${theme.speedMarkets.dropDown.borderColor.primary}`,
                    background: theme.speedMarkets.dropDown.background.primary,
                },
                singleValueStyle: {
                    margin: '0',
                    lineHeight: 'unset',
                    color: theme.speedMarkets.dropDown.textColor.primary,
                },
                dropdownIndicatorStyle: { padding: '0 10px 2px 0' },
                menuStyle: {
                    marginTop: 2,
                    fontSize: '12px',
                    backgroundColor: theme.speedMarkets.dropDown.background.primary,
                    borderColor: theme.speedMarkets.dropDown.borderColor.primary,
                },
                optionStyle: { padding: '7px 12px', borderRadius: '5px' },
            }}
        />
    );
};

const SingleValueText = styled.span`
    font-size: 12px;
`;

const TimeIcon = styled.i`
    font-size: 19px;
    color: ${(props) => props.theme.speedMarkets.dropDown.textColor.primary};
    margin-right: 5px;
`;

const DownIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.speedMarkets.dropDown.indicatorColor.primary};
`;

export default SelectTime;

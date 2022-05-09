import React from 'react';
import { FieldContainer, FieldLabel, OverlayContainer } from '../common';
import { useTranslation } from 'react-i18next';
import { MINIMUM_POSITIONS } from 'constants/markets';
import PositionInput from './PositionInput';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivStart } from 'styles/common';
import FieldValidationMessage from 'components/FieldValidationMessage';
import Tooltip from 'components/Tooltip';

type PositionsProps = {
    positions: string[];
    label?: string;
    onPositionChange: (index: number, text: string) => void;
    onPositionRemove: (index: number) => void;
    onPositionAdd: () => void;
    disabled?: boolean;
    maxPositions: number;
    maximumCharacters?: number;
    tooltip?: string;
};

const Positions: React.FC<PositionsProps> = ({
    positions,
    label,
    onPositionChange,
    onPositionRemove,
    onPositionAdd,
    disabled,
    maxPositions,
    maximumCharacters,
    tooltip,
}) => {
    const { t } = useTranslation();

    const enableRemovePosition = positions.length > MINIMUM_POSITIONS;
    const enableAddPosition = positions.length < maxPositions;

    const hasSamePositions =
        positions.filter((item, index) => positions.indexOf(item) != index && item.trim() !== '').length > 0;

    return (
        <FieldContainer>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && (
                        <Tooltip
                            overlay={<OverlayContainer>{tooltip}</OverlayContainer>}
                            iconFontSize={23}
                            marginLeft={2}
                            top={0}
                        />
                    )}
                </FieldLabel>
            )}
            {positions.map((position: string, index: number) => {
                return (
                    <PositionInput
                        key={`position${index}`}
                        value={position}
                        onChange={(text: string) => onPositionChange(index, text)}
                        onRemove={() => {
                            if (disabled) {
                                return;
                            }
                            onPositionRemove(index);
                        }}
                        showRemoveButton={enableRemovePosition}
                        disabled={disabled}
                        maximumCharacters={maximumCharacters}
                        note={t('common.input-characters-note', {
                            entered: position.length,
                            max: maximumCharacters,
                        })}
                    />
                );
            })}
            {enableAddPosition && (
                <AddPositionButton
                    onClick={() => {
                        if (disabled) {
                            return;
                        }
                        onPositionAdd();
                    }}
                    className={disabled ? 'disabled' : ''}
                >
                    <PlusSign>+</PlusSign>
                    {t('market.create-market.add-position-label')}
                </AddPositionButton>
            )}
            <ValidationContainer>
                <FieldValidationMessage
                    showValidation={hasSamePositions}
                    message={t(`common.errors.different-position`)}
                    hideArrow
                />
            </ValidationContainer>
        </FieldContainer>
    );
};

const AddPositionButton = styled(FlexDivStart)`
    font-weight: normal;
    font-size: 20px;
    line-height: 100%;
    align-items: center;
    margin-left: 2px;
    margin-top: -4px;
    cursor: pointer;
    width: fit-content;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const PlusSign = styled(FlexDivCentered)`
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    font-weight: bold;
    font-size: 20px;
    border-radius: 3px;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    margin-bottom: 2px;
    padding-bottom: 1px;
    padding-left: 1px;
`;

const ValidationContainer = styled(FlexDivStart)`
    > div {
        width: fit-content;
    }
`;

export default Positions;

import React, { CSSProperties, useState } from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from '../../styles/common';
import OutsideClickHandler from 'react-outside-click-handler';
import { useTranslation } from 'react-i18next';

type DropdownProperties<T> = {
    disabled?: boolean;
    list: T[];
    selectedItem: T;
    onSelect: (item: T) => void;
    itemRenderer?: (item: T) => React.Component;
    style?: CSSProperties;
};

function Dropdown<T>({ list, onSelect, disabled, itemRenderer, selectedItem, style }: DropdownProperties<T>) {
    const { t } = useTranslation();
    const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
    const setItemDropdownIsOpen = (isOpen: boolean) => {
        if (!isOpen && !dropdownIsOpen) {
            return;
        }
        setDropdownIsOpen(isOpen);
    };

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setItemDropdownIsOpen(false)}>
                <Container style={style}>
                    <DropdownButton
                        onClick={() => {
                            setItemDropdownIsOpen(!dropdownIsOpen);
                        }}
                        className={disabled ? 'disabled' : ''}
                    >
                        {t(`common.odds.${selectedItem}`)}
                        <FlexDiv>
                            <ArrowDownIcon className={`icon-exotic icon-exotic--down`} />
                        </FlexDiv>
                    </DropdownButton>
                    {dropdownIsOpen && (
                        <DropdownContainer>
                            <DropDown>
                                {list.map((item: T, index: number) => (
                                    <DropDownItem
                                        key={index}
                                        onClick={() => {
                                            onSelect(item);
                                            setItemDropdownIsOpen(false);
                                        }}
                                    >
                                        <FlexDivCentered>
                                            {itemRenderer ? (
                                                itemRenderer(item)
                                            ) : (
                                                <Label> {t(`common.odds.${item}`)}</Label>
                                            )}
                                        </FlexDivCentered>
                                    </DropDownItem>
                                ))}
                            </DropDown>
                        </DropdownContainer>
                    )}
                </Container>
            </OutsideClickHandler>
        </>
    );
}

const Container = styled(FlexDivColumnCentered)`
    width: 200px;
`;

const DropdownButton = styled.button`
    position: relative;
    height: 24px;
    border: none;
    background: transparent;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    align-items: center;
    text-align: right;
    padding-right: 23px;
    letter-spacing: 0.01em;
    &:hover:not(.disabled) {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        opacity: 0.4;
        cursor: default;
        background: transparent;
    }
    @media (max-width: 950px) {
        font-size: 11px;
        line-height: 11px;
        &:hover:not(.disabled) {
            color: ${(props) => props.theme.textColor.secondary};
        }
    }
`;

const DropdownContainer = styled.div`
    position: relative;
    z-index: 1000;
`;

const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
    background: #252940;
    color: white;
    border-radius: 5px;
    position: absolute;
    margin-top: 2px;
    padding: 4px;
    width: 100%;
`;

const DropDownItem = styled(FlexDiv)`
    padding: 7px 10px 9px 10px;
    cursor: pointer;
    &:hover {
        background: #5f6180;
        border-radius: 5px;
    }
`;

const Label = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: white;
    display: block;
    text-transform: capitalize;
`;

const ArrowDownIcon = styled.i`
    font-size: 14px;
    position: absolute;
    top: 8px;
    right: 5px;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }

    @media (max-width: 950px) {
        font-size: 13px;
        top: 10px;
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
    }
`;

export default Dropdown;

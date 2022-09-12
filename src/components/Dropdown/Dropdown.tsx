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
                            <ArrowDownIcon />
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
    //width: 200px;
`;

const DropdownButton = styled.button`
    position: relative;
    //width: 200px;
    height: 34px;
    border: none;
    background: #252940;
    color: white;
    border-radius: 10px;
    font-size: 17px;
    line-height: 25px;
    padding-right: 45px;
    padding-left: 15px;
    &:hover:not(.disabled) {
        cursor: pointer;
        background: #5f6180;
    }
    &.disabled {
        opacity: 0.4;
        cursor: default;
        background: transparent;
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
    border-radius: 10px;
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
        border-radius: 12px;
    }
`;

const Label = styled.div`
    font-weight: 500;
    font-size: 17px;
    line-height: 20px;
    color: white;
    display: block;
    text-transform: capitalize;
`;

const ArrowDownIcon = styled.i`
    font-size: 17px;
    margin-left: 20px;
    position: absolute;
    top: 8px;
    right: 15px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004D';
        color: white;
    }
`;

export default Dropdown;

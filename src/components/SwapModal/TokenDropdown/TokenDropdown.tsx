import React, { useState } from 'react';
import { FlexDivCentered, FlexDiv, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import OutsideClickHandler from 'react-outside-click-handler';
import styled from 'styled-components';
import { Token } from 'types/tokens';
import { AVAILABLE_TOKENS } from 'constants/tokens';

type StatusDropdownProps = {
    selectedToken: Token;
    onSelect: any;
    readOnly?: boolean;
    disabled?: boolean;
};

export const TokenDropdown: React.FC<StatusDropdownProps> = ({ selectedToken, onSelect, readOnly, disabled }) => {
    const [tokenDropdownIsOpen, setTokenDropdownIsOpen] = useState(false);
    const setDropdownIsOpen = (isOpen: boolean) => {
        if (!isOpen && !tokenDropdownIsOpen) {
            return;
        }
        setTokenDropdownIsOpen(isOpen);
    };

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <Container readOnly={readOnly}>
                    <TokenButton
                        onClick={() => {
                            if (!readOnly && !disabled) {
                                setDropdownIsOpen(!tokenDropdownIsOpen);
                            }
                        }}
                        readOnly={readOnly}
                        className={disabled ? 'disabled' : ''}
                    >
                        <FlexDiv>
                            <TokenIcon src={selectedToken.logoURI} />
                            {selectedToken.symbol}
                            {!readOnly && <ArrowDownIcon />}
                        </FlexDiv>
                    </TokenButton>
                    {tokenDropdownIsOpen && (
                        <DropdownContainer>
                            <DropDown>
                                {AVAILABLE_TOKENS.map((token: Token) => (
                                    <DropDownItem
                                        key={token.symbol}
                                        onClick={() => {
                                            onSelect(token);
                                            setDropdownIsOpen(false);
                                        }}
                                    >
                                        <FlexDivCentered>
                                            <TokenName>
                                                <TokenIcon src={token.logoURI} />
                                                {token.symbol}
                                            </TokenName>
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
};

const Container = styled(FlexDivColumnCentered)<{ readOnly?: boolean }>`
    width: 140px;
    position: absolute;
    top: 28px;
    left: 5px;
    z-index: ${(props) => (props.readOnly ? 1 : 2)};
`;

const TokenButton = styled.button<{ readOnly?: boolean }>`
    position: relative;
    width: 140px;
    height: 34px;
    border: none;
    background: ${(props) => (props.readOnly ? 'transparent' : props.theme.input.background.primary)};
    color: ${(props) => (props.readOnly ? props.theme.textColor.primary : props.theme.input.textColor.primary)};
    border-radius: 10px;
    font-size: 18px;
    line-height: 25px;
    padding-left: 15px;
    &:hover:not(.disabled) {
        cursor: ${(props) => (props.readOnly ? 'default' : 'pointer')};
        background: ${(props) => (props.readOnly ? 'transparent' : '#e1d9e7')};
    }
    &.disabled {
        opacity: ${(props) => (props.readOnly ? 1 : 0.4)};
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
    background: ${(props) => props.theme.input.background.primary};
    color: ${(props) => props.theme.input.textColor.primary};
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
        background: #e1d9e7;
        border-radius: 12px;
    }
`;

const TokenName = styled.div`
    font-weight: 500;
    font-size: 18px;
    line-height: 20px;
    color: ${(props) => props.theme.input.textColor.primary};
    display: block;
    text-transform: capitalize;
`;

const TokenIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-bottom: -6px;
    margin-right: 6px;
`;

const ArrowDownIcon = styled.i`
    font-size: 18px;
    margin-left: 20px;
    position: absolute;
    top: 8px;
    right: 15px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004D';
        color: ${(props) => props.theme.input.textColor.primary};
    }
`;

export default TokenDropdown;

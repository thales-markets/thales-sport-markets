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
                        <ButtonContent>
                            <TokenIcon src={selectedToken.logoURI} />
                            {selectedToken.symbol}
                            {!readOnly && <ArrowDownIcon />}
                        </ButtonContent>
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
    position: absolute;
    top: 28px;
    left: 7px;
    z-index: ${(props) => (props.readOnly ? 1 : 2)};
`;

const TokenButton = styled.button<{ readOnly?: boolean }>`
    position: relative;
    width: 140px;
    height: 34px;
    border: ${(props) => (props.readOnly ? 'none' : `1px solid ${props.theme.button.borderColor.primary}`)};
    background: ${(props) => (props.readOnly ? 'transparent' : props.theme.button.background.tertiary)};
    color: ${(props) => (props.readOnly ? props.theme.button.textColor.secondary : props.theme.textColor.primary)};
    border-radius: 10px;
    font-size: 18px;
    line-height: 25px;
    padding-left: 12px;
    &:hover:not(.disabled) {
        cursor: ${(props) => (props.readOnly ? 'default' : 'pointer')};
        background: ${(props) => (props.readOnly ? 'transparent' : '#51546f')};
    }
    &.disabled {
        opacity: ${(props) => (props.readOnly ? 1 : 0.4)};
        cursor: default;
        background: transparent;
    }
    @media (max-width: 950px) {
        width: 125px;
    }
`;

const ButtonContent = styled(FlexDiv)`
    line-height: 24px;
`;

const DropdownContainer = styled.div`
    position: relative;
    z-index: 1000;
`;

const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
    background: ${(props) => props.theme.button.background.tertiary};
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
        background: #51546f;
        border-radius: 12px;
    }
`;

const TokenName = styled.div`
    font-weight: 500;
    font-size: 18px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    display: block;
`;

const TokenIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-bottom: -6px;
    margin-right: 6px;
`;

const ArrowDownIcon = styled.i`
    font-size: 18px;
    position: absolute;
    top: 8px;
    right: 15px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004D';
        color: ${(props) => props.theme.textColor.primary};
    }
    @media (max-width: 950px) {
        right: 10px;
    }
`;

export default TokenDropdown;

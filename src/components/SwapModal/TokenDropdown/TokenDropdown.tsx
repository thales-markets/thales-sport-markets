import { AVAILABLE_TOKENS } from 'constants/tokens';
import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { Token } from 'types/tokens';

type StatusDropdownProps = {
    selectedToken: Token;
    onSelect: any;
    disabled?: boolean;
};

const TokenDropdown: React.FC<StatusDropdownProps> = ({ selectedToken, onSelect, disabled }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

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
                <Container>
                    <TokenButton
                        onClick={() => {
                            if (!disabled) {
                                setDropdownIsOpen(!tokenDropdownIsOpen);
                            }
                        }}
                        disabled={!!disabled}
                    >
                        <ButtonContent>
                            {selectedToken.symbol}
                            <ArrowDownIcon />
                        </ButtonContent>
                    </TokenButton>
                    {tokenDropdownIsOpen && (
                        <DropdownContainer>
                            <DropDown>
                                {AVAILABLE_TOKENS.filter((token: Token) => token.chainId === networkId).map(
                                    (token: Token) => (
                                        <DropDownItem
                                            key={token.symbol}
                                            onClick={() => {
                                                onSelect(token);
                                                setDropdownIsOpen(false);
                                            }}
                                        >
                                            <FlexDivCentered>
                                                <TokenName>{token.symbol}</TokenName>
                                            </FlexDivCentered>
                                        </DropDownItem>
                                    )
                                )}
                            </DropDown>
                        </DropdownContainer>
                    )}
                </Container>
            </OutsideClickHandler>
        </>
    );
};

const Container = styled(FlexDivColumnCentered)`
    position: relative;
    align-items: center;
    z-index: 2;
`;

const TokenButton = styled.button<{ disabled: boolean }>`
    min-width: 80px;
    background: ${(props) => props.theme.background.secondary};
    border: ${(props) => props.theme.background.secondary};
    outline: none;
    border-radius: 8px;
    padding: 2px 10px;
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const ButtonContent = styled(FlexDivCentered)`
    font-weight: 400;
    font-size: 15px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const DropdownContainer = styled.div`
    position: relative;
    z-index: 1000;
`;

const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
    position: absolute;
    top: 10px;
    left: -40px;
    width: 80px;
    padding: 5px 5px;
    border-radius: 8px;
    background: ${(props) => props.theme.background.secondary};
`;

const DropDownItem = styled(FlexDiv)`
    padding: 4px 6px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.background.tertiary};
        border-radius: 8px;
    }
`;

const TokenName = styled.div`
    font-weight: 400;
    font-size: 15px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    display: block;
`;

const ArrowDownIcon = styled.i`
    font-size: 12px;
    margin-bottom: -4px !important;
    position: relative;
    margin-left: 6px;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\00D5';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default TokenDropdown;

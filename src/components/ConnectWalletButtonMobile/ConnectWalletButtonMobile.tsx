import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv } from '../../styles/common';

const ConnectWalletButtonMobile: React.FC = () => {
    const dispatch = useDispatch();

    return (
        <RainbowConnectButton.Custom>
            {({ account, chain, openAccountModal, mounted }) => {
                const connected = mounted && account && chain;

                return (
                    <div
                        {...(!mounted && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        <IconContainer>
                            {(() => {
                                if (!connected) {
                                    return (
                                        <ItemIcon
                                            className="icon icon--wallet-disconnected"
                                            onClick={() =>
                                                dispatch(
                                                    setWalletConnectModalVisibility({
                                                        visibility: true,
                                                    })
                                                )
                                            }
                                        />
                                    );
                                }

                                return <ItemIcon onClick={openAccountModal} className="icon icon--wallet-connected" />;
                            })()}
                        </IconContainer>
                    </div>
                );
            }}
        </RainbowConnectButton.Custom>
    );
};

const IconContainer = styled(FlexDiv)`
    cursor: pointer;
`;

const ItemIcon = styled.i`
    font-size: 33px;
    color: black;
`;

export default ConnectWalletButtonMobile;

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import styled from 'styled-components';
import { FlexDiv } from '../../styles/common';

const ConnectWalletButtonMobile: React.FC = () => {
    return (
        <RainbowConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
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
                                            onClick={openConnectModal}
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

export const ItemIcon = styled.i`
    font-size: 33px;
    color: black;
`;

export default ConnectWalletButtonMobile;

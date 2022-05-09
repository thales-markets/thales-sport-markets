import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { L1_TO_L2_NETWORK_MAPPER, OPTIMISM_NETWORKS } from 'constants/network';
import { NetworkIdByName } from 'utils/network';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';

const UnsupportedNetwork: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const switchOrAddOptimismNetwork = async () => {
        const switchTo = L1_TO_L2_NETWORK_MAPPER[networkId] ?? NetworkIdByName.OptimsimMainnet;
        const optimismNetworkParms = OPTIMISM_NETWORKS[switchTo];

        if (typeof window.ethereum !== 'undefined') {
            try {
                await (window.ethereum as any).request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: optimismNetworkParms.chainId }],
                });
                location.reload();
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    try {
                        await (window.ethereum as any).request({
                            method: 'wallet_addEthereumChain',
                            params: [optimismNetworkParms],
                        });
                        await (window.ethereum as any).request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: optimismNetworkParms.chainId }],
                        });
                        location.reload();
                    } catch (addError) {
                        console.log(addError);
                    }
                } else {
                    console.log(switchError);
                }
            }
        }
    };

    return (
        <Container>
            <Wrapper>
                <Title>{t(`common.unsupported-network.title`)}</Title>
                <Description>{t(`common.unsupported-network.description`)}</Description>
                <ButtonContainer>
                    <Button onClick={switchOrAddOptimismNetwork}>
                        {t(`common.unsupported-network.button.optimism`)}
                    </Button>
                </ButtonContainer>
            </Wrapper>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    position: fixed;
    height: 100%;
    width: 100%;
    background: ${(props) => props.theme.background.primary};
`;

const Wrapper = styled(FlexDivColumnCentered)`
    max-width: 600px;
    padding: 20px;
    text-align: center;
`;

const Title = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    letter-spacing: 0.25px;
    font-size: 32px;
    line-height: 48px;
`;

const Description = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    letter-spacing: 0.25px;
    font-size: 16px;
    line-height: 32px;
    margin-top: 45px;
`;

const ButtonContainer = styled.div`
    margin: 80px 0px;
`;

const Button = styled.button`
    background: ${(props) => props.theme.button.background.primary};
    padding: 4px 35px;
    border-radius: 30px;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 27px;
    color: ${(props) => props.theme.button.textColor.primary};
    text-align: center;
    border: none;
    outline: none;
    text-transform: none !important;
    cursor: pointer;
    white-space: break-spaces;
    &:hover {
        opacity: 0.8;
    }
`;

export default UnsupportedNetwork;

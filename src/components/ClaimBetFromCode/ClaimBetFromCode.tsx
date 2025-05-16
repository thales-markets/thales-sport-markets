import Button from 'components/Button';
import TextInput from 'components/fields/TextInput';
import { t } from 'i18next';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnNative } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { claimFreeBet } from 'utils/freeBet';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const ClaimBetFromCode: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector(getIsBiconomy);
    const { address, isConnected } = useAccount();

    const { switchChain } = useSwitchChain();
    const networkId = useChainId();

    const [freeBetCode, setFreeBetCode] = useState<string>('');

    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    return (
        <FreeBetCodeContainer gap={10}>
            <FreeBetExplainer>{t('markets.parlay.claim-free-bet-explainer')}</FreeBetExplainer>
            <TextInput
                disabled={!isConnected}
                value={freeBetCode}
                onChange={(e: any) => {
                    setFreeBetCode(e.target.value);
                }}
                inputPadding="5px 10px"
                borderColor={theme.input.borderColor.tertiary}
                placeholder={isConnected ? t('markets.parlay.enter-code') : t('markets.parlay.sign-in-to-claim')}
            />
            <FlexDivCentered>
                <Button
                    backgroundColor={theme.input.borderColor.tertiary}
                    onClick={async () => {
                        await claimFreeBet(walletAddress, freeBetCode, networkId, () => {}, history, switchChain);
                        setFreeBetCode('');
                    }}
                    disabled={!isConnected || !freeBetCode || freeBetCode.length !== 10}
                    width="100%"
                >
                    {t('markets.parlay.claim')}
                </Button>
            </FlexDivCentered>
        </FreeBetCodeContainer>
    );
};

const FreeBetCodeContainer = styled(FlexDivColumnNative)`
    width: 100%;
`;

const FreeBetExplainer = styled.div`
    padding: 2px;
    margin-top: 15px;
    font-weight: 400;
    text-align: justify;
    font-size: 15px;
    line-height: 18px;
`;

export default ClaimBetFromCode;

import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import { DEFAULT_PRICE_SLIPPAGES_PERCENTAGE, DELTA_TIMES_MINUTES } from 'constants/speedMarkets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPEED_MARKETS_WIDGET_DEFAULT_RIGHT, SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { minutesToSeconds } from 'date-fns';
import { WidgetMenuItems } from 'enums/speedMarkets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useLocalStorage from 'hooks/useLocalStorage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';
import NotificationsCount from '../NotificationsCount';
import SelectTime from '../SelectTime';
import SpeedPositions from '../SpeedPositions';
import SpeedSettings from '../SpeedSettings';
import SpeedTrading from '../SpeedTrading';

const SpeedMarketsWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();

    const isConnectWalletModalVisibile = useSelector(getWalletConnectModalVisibility);

    const networkId = useChainId();
    const { isConnected } = useAccount();

    const [activeMenuItem, setActiveMenuItem] = useState(WidgetMenuItems.TRADING);
    const [deltaTimeSec, setDeltaTimeSec] = useState(minutesToSeconds(DELTA_TIMES_MINUTES[0]));
    const [priceSlippage, setPriceSlippage] = useLocalStorage(
        LOCAL_STORAGE_KEYS.SPEED_PRICE_SLIPPAGE,
        DEFAULT_PRICE_SLIPPAGES_PERCENTAGE[1]
    );

    // Reset delta time
    useEffect(() => {
        if (!isConnected) {
            setDeltaTimeSec(minutesToSeconds(DELTA_TIMES_MINUTES[0]));
        }
    }, [isConnected]);

    useEffect(() => {
        setDeltaTimeSec(minutesToSeconds(DELTA_TIMES_MINUTES[0]));
    }, [networkId]);

    return (
        <Container isHidden={!isConnected && isConnectWalletModalVisibile}>
            <HeaderRow>
                <Header>
                    <SPAAnchor href={buildHref(LINKS.SpeedMarkets)}>
                        <LogoIcon className="speedmarkets-logo-icon speedmarkets-logo-icon--speed-full-logo" />
                    </SPAAnchor>
                    {activeMenuItem === WidgetMenuItems.TRADING && (
                        <SelectTime deltaTimeSec={deltaTimeSec} setDeltaTimeSec={setDeltaTimeSec} />
                    )}
                </Header>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
            </HeaderRow>
            <Content>
                {activeMenuItem === WidgetMenuItems.TRADING && (
                    <SpeedTrading deltaTimeSec={deltaTimeSec} priceSlippage={priceSlippage} />
                )}
                {activeMenuItem === WidgetMenuItems.POSITIONS && <SpeedPositions />}
                {activeMenuItem === WidgetMenuItems.SETTINGS && (
                    <SpeedSettings priceSlippage={priceSlippage} setPriceSlippage={setPriceSlippage} />
                )}
            </Content>
            <FooterMenu>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.TRADING}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.TRADING)}
                >
                    <FooterMenuIcon className="icon icon--stats" />
                    <FooterMenuItemLabel>{t('speed-markets.menu-items-label.trade')}</FooterMenuItemLabel>
                </FooterMenuItem>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.POSITIONS}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.POSITIONS)}
                >
                    <NotificationsCount isClaimable />
                    <NotificationsCount isClaimable={false} />
                    <FooterMenuIcon className="icon icon--history" />
                    <FooterMenuItemLabel>{t('speed-markets.menu-items-label.positions')}</FooterMenuItemLabel>
                </FooterMenuItem>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.SETTINGS}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.SETTINGS)}
                >
                    <FooterMenuIcon className="speedmarkets-icon speedmarkets-icon--gear" />
                    <FooterMenuItemLabel>{t('speed-markets.menu-items-label.settings')}</FooterMenuItemLabel>
                </FooterMenuItem>
            </FooterMenu>
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ isHidden: boolean }>`
    ${(props) => (props.isHidden ? 'display: none;' : '')};
    position: fixed;
    bottom: 20px;
    right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT}px;
    width: 360px;
    height: 620px;
    padding: 11px;
    background: ${(props) => props.theme.speedMarkets.background.primary};
    border: 1px solid ${(props) => props.theme.speedMarkets.borderColor.primary};
    border-radius: 15px;
    box-shadow: 0px -17px 10px 4px ${(props) => props.theme.speedMarkets.shadow.primary};
    z-index: ${SPEED_MARKETS_WIDGET_Z_INDEX};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        height: 100%;
        right: 0;
        bottom: 0;
        border-radius: 0;
        border: unset;
    }
`;

const HeaderRow = styled(FlexDivRowCentered)`
    gap: 8px;
    margin-bottom: 5px;
`;
const Header = styled(FlexDivRowCentered)`
    width: 100%;
`;

const LogoIcon = styled.i`
    font-size: 105px;
    line-height: 38px;
    overflow: hidden;
    cursor: pointer;
`;

const CloseIcon = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.speedMarkets.borderColor.primary};
    cursor: pointer;
`;

const Content = styled(FlexDivColumn)`
    gap: 9px;
    height: 100%;
`;

const FooterMenu = styled(FlexDivCentered)`
    gap: 30px;
    margin-top: 20px;
`;

const FooterMenuItem = styled.div<{ isActive: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    color: ${(props) =>
        props.isActive ? props.theme.speedMarkets.textColor.active : props.theme.speedMarkets.textColor.inactive};
    cursor: pointer;
`;
const FooterMenuIcon = styled.i`
    font-size: 18px;
`;
const FooterMenuItemLabel = styled.span`
    font-size: 11px;
    font-weight: 600;
    line-height: normal;
`;

export default SpeedMarketsWidget;

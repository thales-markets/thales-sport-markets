import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_WIDGET_DEFAULT_RIGHT, SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { WidgetMenuItems } from 'enums/speedMarkets';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import SpeedPositions from '../SpeedPositions';
import SpeedTrading from '../SpeedTrading';

const SpeedMarketsWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();

    const [activeMenuItem, setActiveMenuItem] = useState(WidgetMenuItems.TRADING);

    return (
        <Container>
            <HeaderRow>
                <Header>
                    <SPAAnchor href={buildHref(LINKS.SpeedMarkets)}>
                        <LogoIcon className="speedmarkets-logo-icon speedmarkets-logo-icon--speed-full-logo" />
                    </SPAAnchor>
                </Header>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
            </HeaderRow>
            <Content>
                {activeMenuItem === WidgetMenuItems.TRADING && <SpeedTrading />}
                {activeMenuItem === WidgetMenuItems.POSITIONS && <SpeedPositions />}
                {activeMenuItem === WidgetMenuItems.SETTINGS && <></>}
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

const Container = styled(FlexDivColumn)`
    position: fixed;
    bottom: 20px;
    right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT}px;
    width: 360px;
    height: 620px;
    padding: 11px;
    background: ${(props) => props.theme.speedMarkets.background.primary};
    border: 1px solid ${(props) => props.theme.speedMarkets.borderColor.primary};
    border-radius: 15px;
    z-index: ${SPEED_MARKETS_WIDGET_Z_INDEX};
`;

const HeaderRow = styled(FlexDivRowCentered)`
    margin-bottom: 5px;
`;
const Header = styled.div`
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
    gap: 10px;
    height: 100%;
`;

const FooterMenu = styled(FlexDivCentered)`
    gap: 30px;
    margin-top: 16px;
`;

const FooterMenuItem = styled.div<{ isActive: boolean }>`
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

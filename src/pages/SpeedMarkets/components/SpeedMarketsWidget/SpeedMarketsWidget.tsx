import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_DEFAULT_RIGHT } from 'constants/ui';
import { WidgetMenuItems } from 'enums/speedMarkets';
import { useState } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import Trading from '../Trading';

const SpeedMarketsWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                {activeMenuItem === WidgetMenuItems.TRADING && <Trading />}
                {activeMenuItem === WidgetMenuItems.POSITIONS && <></>}
                {activeMenuItem === WidgetMenuItems.SETTINGS && <></>}
            </Content>
            <FooterMenu>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.TRADING}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.TRADING)}
                >
                    <FooterMenuIcon className="icon icon--stats" />
                    <FooterMenuItemLabel>Trade</FooterMenuItemLabel>
                </FooterMenuItem>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.POSITIONS}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.POSITIONS)}
                >
                    <FooterMenuIcon className="icon icon--history" />
                    <FooterMenuItemLabel>Positions</FooterMenuItemLabel>
                </FooterMenuItem>
                <FooterMenuItem
                    isActive={activeMenuItem === WidgetMenuItems.SETTINGS}
                    onClick={() => setActiveMenuItem(WidgetMenuItems.SETTINGS)}
                >
                    <FooterMenuIcon className="speedmarkets-icon speedmarkets-icon--gear" />
                    <FooterMenuItemLabel>Settings</FooterMenuItemLabel>
                </FooterMenuItem>
            </FooterMenu>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    position: fixed;
    bottom: 20px;
    right: ${SPEED_MARKETS_DEFAULT_RIGHT}px;
    width: 360px;
    height: 620px;
    padding: 13px 11px;
    background: ${(props) => props.theme.speedMarkets.background.primary};
    border: 1px solid ${(props) => props.theme.speedMarkets.borderColor.primary};
    border-radius: 15px;
    z-index: 3000000000; // discord has 2147483000
`;

const HeaderRow = styled(FlexDivRowCentered)``;
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
    height: 60px;
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

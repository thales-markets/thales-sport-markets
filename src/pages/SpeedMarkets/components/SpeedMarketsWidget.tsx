import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_DEFAULT_RIGHT } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';

const SpeedMarketsWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <Container>
            <HeaderRow>
                <Header>
                    <SPAAnchor href={buildHref(LINKS.SpeedMarkets)}>
                        <LogoIcon className="speedmarkets-icon speedmarkets-icon--speed-full-logo" />
                    </SPAAnchor>
                </Header>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
            </HeaderRow>
            <Chart></Chart>
            <Trading></Trading>
            <Footer>
                <div>Trade</div>
                <div>Positions</div>
                <div>Settings</div>
            </Footer>
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

const Chart = styled.div`
    height: 180px;
`;

const Trading = styled(FlexDivColumn)`
    gap: 10px;
    height: 100%;
`;

const Footer = styled(FlexDivCentered)`
    gap: 30px;
    height: 60px;
`;

export default SpeedMarketsWidget;

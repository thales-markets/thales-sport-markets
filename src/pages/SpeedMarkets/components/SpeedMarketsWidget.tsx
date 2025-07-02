import { SPEED_MARKETS_DEFAULT_RIGHT } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

const SpeedMarketsWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <Container>
            <HeaderRow>
                <Header></Header>
                <CloseIcon className="icon icon--close" onClick={() => onClose()} />
            </HeaderRow>
        </Container>
    );
};

const Container = styled.div`
    position: fixed;
    bottom: 20px;
    right: ${SPEED_MARKETS_DEFAULT_RIGHT}px;
    width: 360px;
    height: 620px;
    background: ${(props) => props.theme.speedMarkets.background.primary};
    border: 1px solid ${(props) => props.theme.speedMarkets.borderColor.primary};
    border-radius: 15px;
    z-index: 100000;
`;

const HeaderRow = styled(FlexDivRowCentered)`
    padding: 13px 18px;
`;
const Header = styled.div`
    width: 100%;
`;
const CloseIcon = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.speedMarkets.borderColor.primary};
    cursor: pointer;
`;

export default SpeedMarketsWidget;

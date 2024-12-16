import styled from 'styled-components';
import { Colors } from 'styles/common';
import Zebra from 'assets/images/overtime-zebra.svg?react';

const ActivateAccount: React.FC<any> = () => {
    return (
        <Wrapper>
            <StyledBalanceIcon />
            <Header>Deposit Received!</Header>
            <SubTitle>Activate Your Overtime Account for this device.</SubTitle>
            <Box>
                To start trading, your Overtime Account must be activated. This will set up collateral approval and
                session parameters for secure and seamless trading.
            </Box>
            <ActivateButton>Activate My Account</ActivateButton>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    right: -4px;
    background: ${Colors.GOLD};
    width: 416px;
    padding: 20px;
    border-radius: 16px;
    z-index: 1000;
`;

const StyledBalanceIcon = styled(Zebra)`
    text-align: center;
    height: 55px;
    width: 255px;
    path {
        fill: ${(props) => props.theme.textColor.senary};
    }
`;

const Header = styled.h2`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 24px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 13px;
    margin-bottom: 3px;
`;

const SubTitle = styled.p`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
`;

const Box = styled.div`
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.overdrop.textColor.quaternary};
    padding: 16px 10px;
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    text-align: left;
    margin-top: 25px;
    margin-bottom: 24px;
`;

const ActivateButton = styled.div`
    border-radius: 12px;
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    height: 56px;
    padding: 18px;
    width: 100%;
`;

export default ActivateAccount;

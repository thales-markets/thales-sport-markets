import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId, getWalletAddress, getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { getCollaterals } from 'utils/collaterals';
import { formatCurrency } from 'utils/formatters/number';

const BalanceDetails: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    return (
        <BalanceWrapper>
            <SectionLabel>{'Balance'}</SectionLabel>
            <TotalBalance>{'$304.654'}</TotalBalance>
            <TokenBalancesWrapper>
                {getCollaterals(networkId, true).map((token, index) => {
                    return (
                        <IndividualTokenBalanceWrapper key={`ind-token-${index}`}>
                            <Token>
                                <TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />
                                {token}
                            </Token>
                            <IndividualTokenBalance>
                                {multipleCollateralBalances.data
                                    ? formatCurrency(multipleCollateralBalances.data[token])
                                    : 0}
                            </IndividualTokenBalance>
                        </IndividualTokenBalanceWrapper>
                    );
                })}
            </TokenBalancesWrapper>
        </BalanceWrapper>
    );
};

const BalanceWrapper = styled(FlexDiv)`
    flex-direction: column;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    border-radius: 5px;
    padding: 19px;
    margin-bottom: 20px;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
`;

const SectionLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 3px;
    margin-bottom: 13px;
`;

const TotalBalance = styled.span`
    font-size: 42px;
    font-weight: 700;
    width: 100%;
    border-bottom: 1px ${(props) => props.theme.borderColor.primary} solid;
    margin-bottom: 20px;
    padding-bottom: 20px;
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    min-width: 150px;
    margin-right: 40px;
    @media (max-width: 575px) {
        margin-right: 10px;
    }
`;

const Token = styled(FlexDiv)`
    font-weight: 700;
    align-items: center;
    font-size: 12px;
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

const IndividualTokenBalance = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-align: right;
`;

export default BalanceDetails;

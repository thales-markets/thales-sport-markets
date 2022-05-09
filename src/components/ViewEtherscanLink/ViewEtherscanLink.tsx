import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getEtherscanTxLink } from 'utils/etherscan';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';

type ViewEtherscanLinkProps = {
    isDisabled?: boolean;
    hash: string;
};

export const ViewEtherscanLink: React.FC<ViewEtherscanLinkProps> = ({ hash }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    return (
        <>
            <StyledLink href={getEtherscanTxLink(networkId, hash)} target="_blank" rel="noreferrer">
                {t('common.view')}
            </StyledLink>
        </>
    );
};

const StyledLink = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    :hover {
        text-decoration: underline;
    }
`;

export default ViewEtherscanLink;

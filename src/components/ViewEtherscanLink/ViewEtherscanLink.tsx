import { Network } from 'enums/network';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getEtherscanTxLink } from 'thales-utils';

type ViewEtherscanLinkProps = {
    overrideNetwork?: Network;
    isDisabled?: boolean;
    hash: string;
};

const ViewEtherscanLink: React.FC<ViewEtherscanLinkProps> = ({ hash, overrideNetwork }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    return (
        <>
            <StyledLink href={getEtherscanTxLink(overrideNetwork || networkId, hash)} target="_blank" rel="noreferrer">
                {t('common.view')}
            </StyledLink>
        </>
    );
};

const StyledLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
    :hover {
        text-decoration: underline;
    }
`;

export default ViewEtherscanLink;

import { Network } from 'enums/network';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getEtherscanTxLink } from 'thales-utils';
import { useChainId } from 'wagmi';

type ViewEtherscanLinkProps = {
    overrideNetwork?: Network;
    isDisabled?: boolean;
    hash: string;
};

const ViewEtherscanLink: React.FC<ViewEtherscanLinkProps> = ({ hash, overrideNetwork }) => {
    const { t } = useTranslation();

    const networkId = useChainId();

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

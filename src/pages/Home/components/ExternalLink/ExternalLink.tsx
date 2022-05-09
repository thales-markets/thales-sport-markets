import React from 'react';
import styled from 'styled-components';

type ExternalLinkProps = {
    href: string;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
    return (
        <Link target="_blank" rel="noreferrer" href={href}>
            {children}
        </Link>
    );
};

const Link = styled.a`
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 30px;
`;

export default ExternalLink;

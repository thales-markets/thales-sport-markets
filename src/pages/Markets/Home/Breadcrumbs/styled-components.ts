import styled from 'styled-components';

export const BreadcrumbsContainer = styled.div`
    color: ${(props) => props.theme.textColor.secondary};
`;

export const Breadcrumb = styled.span`
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    :hover {
        text-decoration: underline;
    }
`;

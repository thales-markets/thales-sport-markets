import styled from 'styled-components';

export const BreadcrumbsContainer = styled.div`
    color: ${(props) => props.theme.textColor.secondary};
    padding: 0 5px;
`;

export const Breadcrumb = styled.span`
    cursor: pointer;
    :hover {
        text-decoration: underline;
    }
`;
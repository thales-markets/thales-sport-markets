import styled from 'styled-components';

export const BreadcrumbsContainer = styled.div`
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    margin-bottom: 10px;
`;

export const Breadcrumb = styled.span`
    cursor: pointer;
    :hover {
        text-decoration: underline;
    }
`;

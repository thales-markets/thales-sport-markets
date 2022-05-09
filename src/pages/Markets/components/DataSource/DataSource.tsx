import Tooltip from 'components/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { isValidHttpsUrl } from 'utils/markets';

type DataSourceProps = {
    dataSource: string;
};

const DataSource: React.FC<DataSourceProps> = ({ dataSource }) => {
    const { t } = useTranslation();

    return (
        <Tooltip
            overlay={
                isValidHttpsUrl(dataSource) ? (
                    <Link target="_blank" rel="noreferrer" href={dataSource}>
                        {dataSource}
                    </Link>
                ) : (
                    <span>{dataSource}</span>
                )
            }
            component={
                <Container>
                    <DataSourceLabel>{t('market.data-source-label')}</DataSourceLabel>
                </Container>
            }
        />
    );
};

const Container = styled(FlexDivCentered)`
    @media (max-width: 767px) {
        margin-top: 20px;
    }
`;

const DataSourceLabel = styled.span`
    background: transparent;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 5px 20px;
    border-radius: 30px;
    font-style: normal;
    font-weight: bold;
    font-size: 17px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    outline: none;
    text-transform: none;
    min-height: 28px;
    width: 146px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const Link = styled.a`
    :hover {
        text-decoration: underline;
    }
    :visited {
        color: ${(props) => props.theme.textColor.tertiary};
    }
`;

export default DataSource;

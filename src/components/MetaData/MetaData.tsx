import React from 'react';
import { Helmet } from 'react-helmet';
import { PAGE_NAME_TO_META_DATA_KEYS } from 'constants/routes';
import { useTranslation } from 'react-i18next';
import { getMetaRouteItem } from 'utils/routes';
import { getQueryStringVal } from 'utils/useQueryParams';

const MetaData: React.FC = () => {
    const { t } = useTranslation();

    const dynamicTitle = getQueryStringVal('title');

    const metaRoute = getMetaRouteItem(location.pathname);

    return (
        <Helmet>
            <title>
                {t(PAGE_NAME_TO_META_DATA_KEYS[metaRoute].title, dynamicTitle ? { dynamicTitle } : undefined)}
            </title>
            <meta
                name="description"
                content={t(
                    PAGE_NAME_TO_META_DATA_KEYS[metaRoute].description,
                    dynamicTitle ? { dynamicTitle } : undefined
                )}
            />
        </Helmet>
    );
};

export default MetaData;

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { PAGE_NAME_TO_META_DATA_KEYS } from 'constants/routes';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getMetaRouteItem } from 'utils/routes';
import queryString from 'query-string';

const MetaData: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const queryParams: { title?: string } = queryString.parse(location.search);

    const [dynamicTitle, setDynamicTitle] = useState<string>('');

    useEffect(() => {
        if (queryParams?.title) {
            setDynamicTitle(queryParams?.title);
        }
    }, [queryParams?.title]);

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

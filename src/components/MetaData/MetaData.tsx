import React from 'react';
import { Page } from 'types/ui';
import { Helmet } from 'react-helmet';
import { PAGE_NAME_TO_META_DATA_KEYS } from 'constants/routes';
import { useTranslation } from 'react-i18next';

type MetaDataProps = {
    page: Page;
};

const MetaData: React.FC<MetaDataProps> = ({ page }) => {
    const { t } = useTranslation();

    return (
        <Helmet>
            <title>{t(PAGE_NAME_TO_META_DATA_KEYS[page].title)}</title>
            <meta name="description" content={t(PAGE_NAME_TO_META_DATA_KEYS[page].description)} />
        </Helmet>
    );
};

export default MetaData;

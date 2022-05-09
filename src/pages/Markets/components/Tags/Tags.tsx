import useTagsQuery from 'queries/markets/useTagsQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivStart } from 'styles/common';
import { Tags as TagList } from 'types/markets';

type TagsProps = {
    tags: number[];
    labelFontSize?: number;
};

const Tags: React.FC<TagsProps> = ({ tags, labelFontSize }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [availableTags, setAvailableTags] = useState<TagList>([]);

    const tagsQuery = useTagsQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (tagsQuery.isSuccess && tagsQuery.data) {
            setAvailableTags(tagsQuery.data);
        }
    }, [tagsQuery.isSuccess, tagsQuery.data]);

    return (
        <Container>
            <TagLabel labelFontSize={labelFontSize}>{t('market.tags-label')}:</TagLabel>
            {tags.map((tag: number) => {
                const findTagItem = availableTags.find((t) => t.id == tag);
                return findTagItem ? <Tag key={findTagItem.label}>{findTagItem.label}</Tag> : null;
            })}
        </Container>
    );
};

const Container = styled(FlexDivStart)`
    flex-wrap: wrap;
    align-items: center;
`;

export const TagLabel = styled.span<{ labelFontSize?: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: ${(props) => props.labelFontSize || 15}px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 4px;
`;

const Tag = styled(FlexDivCentered)`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 30px;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 20px;
    padding: 4px 8px;
    margin-left: 6px;
    height: 28px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 4px;
`;

export default Tags;

import { TAGS_LIST } from 'constants/tags';
import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivStart } from 'styles/common';

type TagsProps = {
    sport: string;
    tags: number[];
    isFinished?: boolean;
};

const Tags: React.FC<TagsProps> = ({ sport, tags, isFinished }) => {
    return (
        <Container isFinished={isFinished}>
            {tags.map((tag: number) => {
                const findTagItem = TAGS_LIST.find((t) => t.id == tag);
                return findTagItem ? (
                    <FlexDivCentered key={findTagItem.id}>
                        <SportIcon className={`icon icon--${sport.toLowerCase()}`} />{' '}
                        <Tag>{sport + ' / ' + formatTagLabel(findTagItem.label)}</Tag>
                    </FlexDivCentered>
                ) : null;
            })}
        </Container>
    );
};

const formatTagLabel = (label: string) => {
    switch (label) {
        case 'UEFA Champions League':
            return 'UEFA CL';
        case `NCAA Football`:
            return 'NCAA';
        default:
            return label;
    }
};

const Container = styled(FlexDivStart)<{ isFinished?: boolean }>`
    flex-wrap: wrap;
    align-items: center;
    color: ${(props) => props.theme.textColor.secondary};
    margin-top: ${(props) => (props.isFinished ? '0px' : '11px')};
    position: absolute;
    bottom: 0;
`;

export const TagLabel = styled.span<{ labelFontSize?: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 4px;
`;

const Tag = styled(FlexDivCentered)`
    font-style: normal;
    font-weight: 300;
    font-size: 9px;
    line-height: 10px;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    padding: 4px 4px;
    color: ${(props) => props.theme.textColor.secondary};
    white-space: nowrap;
`;

const SportIcon = styled.i`
    font-size: 20px;
`;

export default Tags;

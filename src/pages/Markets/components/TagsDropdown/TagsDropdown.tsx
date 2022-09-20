import { TAGS_FLAGS } from 'constants/tags';
import React from 'react';
import Flag from 'react-flagpack';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';

type TagsDropdownProps = {
    open: boolean;
    tags: Tags;
    tagFilter: TagInfo;
    allTag: TagInfo;
    setTagFilter: any;
    setTagParam: any;
};

const TagsDropdown: React.FC<TagsDropdownProps> = ({ open, tags, tagFilter, allTag, setTagFilter, setTagParam }) => {
    return (
        <Container open={open}>
            {tags.map((tag: TagInfo) => {
                return (
                    <TagContainer
                        key={tag.id}
                        className={`${tagFilter.id == tag.id ? 'selected' : ''}`}
                        onClick={() => {
                            setTagFilter(tagFilter.id === tag.id ? allTag : tag);
                            setTagParam(tagFilter.id === tag.id ? allTag.label : tag.label);
                        }}
                    >
                        {LeagueFlag(tag.id)}
                        <Label>{tag.label}</Label>
                    </TagContainer>
                );
            })}
        </Container>
    );
};

const LeagueFlag = (tagId: number | any) => {
    switch (tagId) {
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NFL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.MLB:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NBA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.NHL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.WNBA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.MLS:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="USA" />;
        case TAGS_FLAGS.EPL:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="GB-ENG" />;
        case TAGS_FLAGS.LIGUE_ONE:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="FR" />;
        case TAGS_FLAGS.BUNDESLIGA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="DE" />;
        case TAGS_FLAGS.LA_LIGA:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="ES" />;
        case TAGS_FLAGS.SERIE_A:
            return <Flag size="m" hasBorder={true} hasBorderRadius={false} code="IT" />;
        // case TAGS_FLAGS.UEFA_CL:
        //     return <Flag code="EU" />;
        // case TAGS_FLAGS.FORMULA1:
        //     return <Flag code="EU" />;
        // case TAGS_FLAGS.MOTOGP:
        //     return <Flag code="EU" />;
        default:
            return <Flag size="m" code="USA" />;
    }
};

const Container = styled.div<{ open: boolean }>`
    display: ${(props) => (!props.open ? 'none' : '')};
`;

const TagContainer = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    margin-left: 60px;
    &.selected,
    &:hover:not(.disabled) {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: flex-start;
`;

const Label = styled.div`
    margin-left: 10px;
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

export default TagsDropdown;

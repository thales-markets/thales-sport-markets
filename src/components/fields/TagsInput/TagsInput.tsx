import React from 'react';
import { FieldContainer, FieldLabel, OverlayContainer } from '../common';
import ReactTags, { Tag } from 'react-tag-autocomplete';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TagButton from 'components/TagButton';
import { FlexDivColumn, FlexDivStart } from 'styles/common';
import Tooltip from 'components/Tooltip';

type TagsInputProps = {
    tags: Tag[];
    suggestions: Tag[];
    label?: string;
    disabled?: boolean;
    maxTags: number;
    onTagAdd: (tag: Tag) => void;
    onTagRemove: (i: number) => void;
    tooltip?: string;
};

const TagsInput: React.FC<TagsInputProps> = ({
    tags,
    suggestions,
    label,
    disabled,
    maxTags,
    onTagAdd,
    onTagRemove,
    tooltip,
}) => {
    const { t } = useTranslation();

    const findTagIndexInSelectedTags = (tag: Tag) => tags.findIndex((tagItem: Tag) => tag.id === tagItem.id);

    return (
        <FieldContainer>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && (
                        <Tooltip
                            overlay={<OverlayContainer>{tooltip}</OverlayContainer>}
                            iconFontSize={23}
                            marginLeft={2}
                            top={0}
                        />
                    )}
                </FieldLabel>
            )}
            <TagsContainer isInputDisabled={tags.length >= maxTags} className={disabled ? 'disabled' : ''}>
                <ReactTags
                    tags={tags}
                    suggestions={suggestions.filter((suggestion: Tag) => !suggestion.disabled)}
                    onAddition={onTagAdd}
                    onDelete={onTagRemove}
                    placeholderText={t('common.tags-placeholder')}
                    removeButtonText={t('common.remove-tag-tooltip')}
                    autoresize={false}
                    allowBackspace={false}
                />
            </TagsContainer>
            <SuggestionsContainer>
                {suggestions.map((suggestion: Tag) => {
                    return (
                        <TagButton
                            disabled={disabled}
                            selected={findTagIndexInSelectedTags(suggestion) > -1}
                            onClick={() => {
                                const tagIndex = findTagIndexInSelectedTags(suggestion);
                                if (tagIndex > -1) {
                                    onTagRemove(tagIndex);
                                } else {
                                    onTagAdd(suggestion);
                                }
                            }}
                            key={suggestion.name}
                        >
                            {suggestion.name}
                        </TagButton>
                    );
                })}
            </SuggestionsContainer>
        </FieldContainer>
    );
};

const TagsContainer = styled(FlexDivColumn)<{ isInputDisabled: boolean }>`
    &.disabled {
        opacity: 0.4;
        cursor: default;
        pointer-events: none;
    }

    .react-tags {
        position: relative;
        padding: 0 0 0 8px;
        border: none;
        background: ${(props) => props.theme.input.background.primary};
        border: 2px solid ${(props) => props.theme.input.borderColor.primary};
        border-radius: 10px;
        min-height: 38px;

        /* shared font styles */
        font-style: normal;
        font-weight: normal;
        font-size: 18px;
        line-height: 25px;
        color: ${(props) => props.theme.input.textColor.primary};

        /* clicking anywhere will focus the input */
        cursor: text;
    }

    .react-tags.is-focused {
        border-color: ${(props) => props.theme.input.borderColor.focus.primary};
    }

    .react-tags__selected {
        display: inline;
    }

    .react-tags__selected-tag {
        display: inline-block;
        box-sizing: border-box;
        padding: 0px 8px;
        margin: 3px 6px 0px 0;
        border: 1px solid ${(props) => props.theme.button.borderColor.primary};
        border-radius: 30px;
        background: ${(props) => props.theme.button.background.secondary};
        height: 28px;
        color: ${(props) => props.theme.button.textColor.primary};

        /* match the font styles */
        font-size: inherit;
        line-height: inherit;
    }

    .react-tags__selected-tag:after {
        font-size: 16px;
        content: '\\2715';
        color: ${(props) => props.theme.button.textColor.primary};
        margin-left: 6px;
    }

    .react-tags__selected-tag:hover,
    .react-tags__selected-tag:focus {
        cursor: pointer;
    }

    .react-tags__search {
        display: inline-block;

        /* match tag layout */
        padding: 4px 2px;
        margin-bottom: 0px;

        /* prevent autoresize overflowing the container */
        max-width: 100%;
    }

    @media screen and (min-width: 30em) {
        .react-tags__search {
            /* this will become the offsetParent for suggestions */
            position: relative;
        }
    }

    .react-tags__search input {
        background: ${(props) => props.theme.input.background.primary};
        /* prevent autoresize overflowing the container */
        max-width: 100%;

        /* remove styles and layout from this element */
        margin: 0;
        padding: 0;
        border: 0;
        outline: none;

        /* match the font styles */
        font-size: inherit;
        line-height: inherit;
        color: ${(props) => props.theme.input.textColor.primary};

        display: ${(props) => (props.isInputDisabled ? 'none' : 'block')};

        &::selection {
            background: ${(props) => props.theme.input.background.selection.primary};
        }
    }

    .react-tags__search input::-ms-clear {
        display: none;
    }

    .react-tags__suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
    }

    @media screen and (min-width: 30em) {
        .react-tags__suggestions {
            width: 240px;
        }
    }

    .react-tags__suggestions ul {
        margin: 4px -10px;
        padding: 0;
        list-style: none;
        background: ${(props) => props.theme.input.background.primary};
        border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
        border-radius: 10px;
        box-shadow: none;
    }

    .react-tags__suggestions li {
        :not(:last-child) {
            border-bottom: 1px solid ${(props) => props.theme.input.borderColor.secondary};
        }
        padding: 6px 8px;
    }

    .react-tags__suggestions li mark {
        text-decoration: underline;
        background: none;
        font-weight: 600;
        color: ${(props) => props.theme.input.textColor.primary};
    }

    .react-tags__suggestions li:hover {
        cursor: pointer;
        background: #e1d9e7;
        :first-child:last-child {
            border-radius: 10px;
        }
        :first-child:not(:last-child) {
            border-radius: 10px 10px 0px 0px;
        }
        :last-child:not(:first-child) {
            border-radius: 0px 0px 10px 10px;
        }
    }

    .react-tags__suggestions li.is-active {
        background: #c4b3d0;
        :first-child:last-child {
            border-radius: 10px;
        }
        :first-child:not(:last-child) {
            border-radius: 10px 10px 0px 0px;
        }
        :last-child:not(:first-child) {
            border-radius: 0px 0px 10px 10px;
        }
    }

    .react-tags__suggestions li.is-disabled {
        opacity: 0.4;
        cursor: auto;
    }
`;

const SuggestionsContainer = styled(FlexDivStart)`
    flex-wrap: wrap;
    align-items: center;
    margin-top: 15px;
`;

export default TagsInput;

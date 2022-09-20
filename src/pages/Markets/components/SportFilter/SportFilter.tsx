import { SPORTS_TAGS_MAP } from 'constants/tags';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getFavouriteLeagues, setFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type SportFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    sport: string;
    onClick: () => void;
};

const SportFilter: React.FC<SportFilterProps> = ({ disabled, selected, sport, onClick, children }) => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const favouriteLeagues = useSelector(getFavouriteLeagues);

    return (
        <Container>
            <LabelContainer
                className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => (!disabled ? onClick() : '')}
            >
                <SportIcon className={`icon icon--${sport.toLowerCase() == 'all' ? 'logo' : sport.toLowerCase()}`} />
                <Label>{`${children} ${disabled ? `\n ${t('common.coming-soon')}` : ''} `}</Label>
            </LabelContainer>

            <RevertIcon
                onClick={() => {
                    const tagsPerSport = SPORTS_TAGS_MAP[sport];
                    const showAllLeagues = favouriteLeagues.map((league) => {
                        if (tagsPerSport.includes(league.id) && league.hidden) {
                            return {
                                id: league.id,
                                label: league.label,
                                logo: league.logo,
                                favourite: league.favourite,
                                hidden: false,
                            };
                        }
                        return league;
                    });
                    dispatch(setFavouriteLeagues(showAllLeagues));
                }}
                className={`icon icon--revert`}
            ></RevertIcon>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 36px;
    margin-left: 20px;
    position: relative;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: flex-start;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    &.selected,
    &:hover:not(.disabled) {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
`;

const Label = styled.div`
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SportIcon = styled.i`
    font-size: 25px;
    margin-right: 15px;
`;

const RevertIcon = styled.i`
    font-size: 20px;
    position: absolute;
    right: 0px;
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default SportFilter;

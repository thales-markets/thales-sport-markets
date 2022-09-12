import Tooltip from 'components/Tooltip';
import { LINKS } from 'constants/links';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Container, Title, Link } from './styled-components';

const HelpUsImprove: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <Tooltip
                overlay={t('quiz.help-us-improve-tooltip')}
                component={
                    <Link target="_blank" rel="noreferrer" href={LINKS.QuizSuggestions}>
                        <Title>
                            {t('quiz.help-us-improve-label')}
                            <Icon />
                        </Title>
                    </Link>
                }
            />
        </Container>
    );
};

export default HelpUsImprove;

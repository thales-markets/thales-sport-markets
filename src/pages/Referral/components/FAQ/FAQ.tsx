import { t } from 'i18next';
import { FAQAnswer, FAQIcon, FAQItem, FAQQuestion } from 'pages/Referral/styled-components';
import { useState } from 'react';

type FAQProps = {
    index: number;
};

const FAQ: React.FC<FAQProps> = ({ index }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <FAQItem expanded={expanded}>
            <FAQQuestion onClick={() => setExpanded(!expanded)}>
                {t(`referral.faq.questions.${index}`)}
                <FAQIcon expanded={expanded}>
                    <i className={expanded ? `icon icon--arrow-up` : `icon icon--arrow-down`} />
                </FAQIcon>
            </FAQQuestion>
            {expanded && <FAQAnswer>{t(`referral.faq.answers.${index}`)}</FAQAnswer>}
        </FAQItem>
    );
};

export default FAQ;

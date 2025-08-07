import AIIcon from 'assets/images/svgs/ai-icon.svg?react';
import axios from 'axios';
import Button from 'components/Button';
import { TextAreaInput } from 'components/fields/common';
import { generalConfig } from 'config/general';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { CopyIcon } from '../../pages/FreeBets/StatsTable';

type GenerateAIContentProps = {
    aiContent: string;
    setAiContent: (content: string) => void;
};

const GenerateAIContent: React.FC<GenerateAIContentProps> = ({ aiContent, setAiContent }) => {
    const theme = useTheme();
    const [loadingAiContent, setLoadingAiContent] = useState<boolean>(false);
    const { t } = useTranslation();

    const handleCopy = () => {
        if (aiContent) {
            navigator.clipboard.writeText(aiContent);
            toast(t('common.text-copied'), { type: 'success' });
        }
    };

    return (
        <AreaWrapper>
            <Area
                hasContent={!!aiContent}
                onChange={(e) => {
                    setAiContent(e.target.value);
                }}
                value={aiContent}
                placeholder={'Post content...'}
            />
            <StyledAIIcon />
            <GenerateButton
                onClick={async () => {
                    setLoadingAiContent(true);
                    const aiResponse = await axios.get(`${generalConfig.OVERDROP_API_URL}/generate-social-content`);
                    setLoadingAiContent(false);
                    if (aiResponse.data) {
                        setAiContent(aiResponse.data);
                    }
                }}
                height="16px"
            >
                Generate
            </GenerateButton>

            {aiContent && (
                <CopyIconWrapper onClick={handleCopy} title="Copy text">
                    <CopyIcon className="icon icon--copy" />
                </CopyIconWrapper>
            )}

            {loadingAiContent && (
                <LoaderWrapper>
                    <Oval
                        color={theme.textColor.quaternary}
                        height={20}
                        width={20}
                        secondaryColor={theme.textColor.primary}
                        ariaLabel="loading-indicator"
                        strokeWidth={2}
                    />
                </LoaderWrapper>
            )}
        </AreaWrapper>
    );
};

const AreaWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const Area = styled(TextAreaInput)<{ hasContent?: boolean }>`
    ${(props) => props.hasContent && 'padding-top: 30px !important;'}
    field-sizing: content;
    ${(props) => (props.hasContent ? 'height: auto;' : 'height: 34px;')}
    ${(props) => props.hasContent && 'padding-bottom: 10px !important;'}
    ${(props) => !props.hasContent && 'padding-left: 130px !important;'}
`;

const GenerateButton = styled(Button)`
    position: absolute;
    height: 16px;
    top: 8px;
    left: 37px;
    padding: 8px;
    text-transform: none;
    background-color: ${(props) => props.theme.textColor.quaternary};
    border-color: ${(props) => props.theme.textColor.quaternary};
    :hover {
        background-color: ${(props) => props.theme.textColor.quaternary};
    }
`;

const StyledAIIcon = styled(AIIcon)`
    position: absolute;
    top: 6px;
    left: 10px;
`;

const CopyIconWrapper = styled.div`
    position: absolute;
    right: 10px;
    top: 6px;
    cursor: pointer;
    opacity: 0.6;

    &:hover {
        opacity: 1;
    }
`;

const LoaderWrapper = styled(FlexDivCentered)`
    position: absolute;
    right: 10px;
    top: calc(50% - 11px);
`;

export default GenerateAIContent;

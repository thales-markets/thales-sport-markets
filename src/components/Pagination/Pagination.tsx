import SelectInput from 'components/SelectInput';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type PaginationProps = {
    paginationOptions: { value: number; label: string }[];
    onResultsPerPageChange: (value: number | null | undefined) => void;
    resultPerPageInfo: {
        value: number | string;
        label: string;
    };
    onPreviousPage: () => void;
    disabledPrevious: boolean;
    onNextPage: () => void;
    disabledNext: boolean;
    label: string;
};

const Pagination: React.FC<PaginationProps> = ({
    paginationOptions,
    onResultsPerPageChange,
    resultPerPageInfo,
    onPreviousPage,
    disabledPrevious,
    onNextPage,
    disabledNext,
    label,
}) => {
    const { t } = useTranslation();

    return (
        <PaginationWrapper>
            <SectionWrapper>
                <PaginationLabel>{t('common.pagination.rows-per-page')}</PaginationLabel>
                <div>
                    <SelectInput
                        options={paginationOptions}
                        value={{ value: resultPerPageInfo.value, label: resultPerPageInfo.label }}
                        handleChange={(value) => onResultsPerPageChange(Number(value))}
                        isPaginationStyle
                    />
                </div>
            </SectionWrapper>

            <SectionWrapper className="flex items-center gap-1">
                <PaginationLabel>{label}</PaginationLabel>
            </SectionWrapper>

            <ActionSection>
                <ArrowWrapper onClick={() => onPreviousPage()} disabled={disabledPrevious}>
                    <ArrowLeft className={'icon icon--arrow-down'} />
                </ArrowWrapper>
            </ActionSection>
            <ActionSection>
                <ArrowWrapper onClick={() => onNextPage()} disabled={disabledNext}>
                    <ArrowRight className={'icon icon--arrow-down'} />
                </ArrowWrapper>
            </ActionSection>
        </PaginationWrapper>
    );
};

const PaginationWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        justify-content: flex-start;
    }
`;

const SectionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin: 0 14px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin: 0 8px;
    }
`;

const PaginationLabel = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 400;
    line-height: 10%;
    letter-spacing: 0.13px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

const ActionSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const ArrowWrapper = styled.span<{ disabled: boolean }>`
    display: flex;
    width: 40px;
    height: 24px;
    justify-content: center;
    align-items: center;
    padding: 4px;
    color: ${(props) => props.theme.textColor.primary};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const ArrowLeft = styled.i`
    font-size: 12px;
    rotate: 90deg;
`;
const ArrowRight = styled.i`
    font-size: 12px;
    rotate: -90deg;
`;

export default Pagination;

import React from 'react';
import styled from 'styled-components';

interface ChipProps {
    label: string;
    onDelete?: () => void;
    color?: string;
    variant?: 'filled' | 'outlined';
    size?: 'small' | 'medium';
    className?: string;
}

const ChipContainer = styled.div<{ color?: string; variant?: 'filled' | 'outlined'; size?: 'small' | 'medium' }>`
    display: inline-flex;
    align-items: center;
    padding: ${({ size }) => (size === 'small' ? '4px 8px' : '8px 16px')};
    border-radius: 16px;
    background-color: ${({ variant, color }) => (variant === 'outlined' ? 'transparent' : color || '#e0e0e0')};
    border: ${({ variant, color }) => (variant === 'outlined' ? `1px solid ${color || '#e0e0e0'}` : 'none')};
    color: ${({ variant, color }) => (variant === 'outlined' ? color || '#000' : '#fff')};
    font-size: ${({ size }) => (size === 'small' ? '0.75rem' : '1rem')};
`;

const ChipLabel = styled.span`
    margin-right: 8px;
`;

const DeleteIcon = styled.span`
    cursor: pointer;
    font-size: 1rem;
    margin-left: 8px;
`;

const Chip: React.FC<ChipProps> = ({ label, onDelete, color, variant = 'filled', size = 'medium', className }) => {
    return (
        <ChipContainer color={color} variant={variant} size={size} className={className}>
            <ChipLabel>{label}</ChipLabel>
            {onDelete && <DeleteIcon onClick={onDelete}>×</DeleteIcon>}
        </ChipContainer>
    );
};

export default Chip;

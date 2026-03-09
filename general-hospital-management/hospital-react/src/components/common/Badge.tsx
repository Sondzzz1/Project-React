import { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
    children?: ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
    className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
    return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}

export default Badge;

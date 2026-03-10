import { ReactNode, MouseEventHandler } from 'react';
import './Button.css';

interface ButtonProps {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
}: ButtonProps) {
    const classNames = ['btn', `btn-${variant}`, `btn-${size}`, loading ? 'btn-loading' : '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} className={classNames} onClick={onClick} disabled={disabled || loading}>
            {loading && <i className="ti-reload spin" />}
            {!loading && icon && <i className={icon} />}
            {children}
        </button>
    );
}

export default Button;

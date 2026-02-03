import './Button.css';

export function Button({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = ''
}) {
    const classNames = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        loading ? 'btn-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <i className="ti-reload spin" />}
            {!loading && icon && <i className={icon} />}
            {children}
        </button>
    );
}

export default Button;

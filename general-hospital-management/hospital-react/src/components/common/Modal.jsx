import { useEffect, useRef } from 'react';
import './Modal.css';

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true
}) {
    const modalRef = useRef(null);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            className="modal-overlay"
            onClick={handleOverlayClick}
        >
            <div className={`modal-content modal-${size}`}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    {showCloseButton && (
                        <button className="modal-close" onClick={onClose}>
                            <i className="ti-close" />
                        </button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;

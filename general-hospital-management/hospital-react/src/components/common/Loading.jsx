import './Loading.css';

export function Loading({ text = 'Đang tải dữ liệu...', fullPage = false }) {
    if (fullPage) {
        return (
            <div className="loading-fullpage">
                <div className="loading-content">
                    <i className="ti-reload spin" />
                    <span>{text}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-spinner">
            <i className="ti-reload spin" />
            <span>{text}</span>
        </div>
    );
}

export default Loading;

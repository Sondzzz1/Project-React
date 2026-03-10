import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
    return (
        <div className="notfound-page">
            <div className="notfound-content">
                <div className="notfound-code">404</div>
                <h1>Trang không tồn tại</h1>
                <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <Link to="/" className="notfound-btn">🏠 Về trang chủ</Link>
            </div>
        </div>
    );
}

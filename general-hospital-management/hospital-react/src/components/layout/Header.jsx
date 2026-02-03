import './Header.css';

export function Header() {
    return (
        <header className="topbar">
            <div className="user-info">
                <i className="ti-bell" />
                <div className="admin-profile">
                    <i className="ti-user" />
                    <span>Quản trị viên</span>
                </div>
            </div>
        </header>
    );
}

export default Header;

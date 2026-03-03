import { NavLink } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { SIDEBAR_MENU } from '../../utils/constants';
import './Sidebar.css';

export default function Sidebar() {
    const { hasPermission } = usePermissions();

    const visibleItems = SIDEBAR_MENU.filter(item => hasPermission(item.permission));

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="sidebar-brand-icon">🏥</span>
                <span className="sidebar-brand-text">Hoàn Mỹ</span>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {visibleItems.map(item => (
                        <li key={item.id}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                <span className="sidebar-label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

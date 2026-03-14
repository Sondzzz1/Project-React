import { NavLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { usePermissions } from '../../hooks/usePermissions';
import { SIDEBAR_MENU, SidebarItem } from '../../constant/context';
import { sidebarCollapsedAtom } from '../../store/atoms';
import './Sidebar.css';

export default function Sidebar() {
    const { hasPermission } = usePermissions();
    const [collapsed, setCollapsed] = useRecoilState(sidebarCollapsedAtom);
    const visibleItems: SidebarItem[] = SIDEBAR_MENU.filter((item) => hasPermission(item.permission));

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-brand">
                <span className="sidebar-brand-icon">🏥</span>
                {!collapsed && <span className="sidebar-brand-text">Hoàn Mỹ</span>}
            </div>
            <button
                className="sidebar-toggle-btn"
                onClick={() => setCollapsed((prev) => !prev)}
                title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
                {collapsed ? '▶' : '◀'}
            </button>
            <nav className="sidebar-nav">
                <ul>
                    {visibleItems.map((item) => (
                        <li key={item.id}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {!collapsed && <span className="sidebar-label">{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

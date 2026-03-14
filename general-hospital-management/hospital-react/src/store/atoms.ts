import { atom } from 'recoil';

// ─── Atom: Sidebar ──────────────────────────────────────────────────────────────
// Quản lý trạng thái đóng/mở của thanh sidebar admin
export const sidebarCollapsedAtom = atom<boolean>({
    key: 'sidebarCollapsedAtom', // key phải là duy nhất trong toàn bộ app
    default: false,              // mặc định: sidebar đang mở
});

// ─── Atom: Notifications ────────────────────────────────────────────────────────
// Quản lý danh sách thông báo hệ thống toàn cục
export interface AppNotification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: string;
}

export const notificationsAtom = atom<AppNotification[]>({
    key: 'notificationsAtom',
    default: [],
});

// ─── Atom: Search Keyword toàn cục ──────────────────────────────────────────────
// Dùng để chia sẻ keyword tìm kiếm giữa nhiều component (nếu cần)
export const globalSearchAtom = atom<string>({
    key: 'globalSearchAtom',
    default: '',
});

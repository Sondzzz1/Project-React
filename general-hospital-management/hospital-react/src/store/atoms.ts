import { atom } from 'recoil';

// ─── Atom: Sidebar ──────────────────────────────────────────────────────────────
// Quản lý trạng thái đóng/mở của thanh sidebar admin
export const sidebarCollapsedAtom = atom<boolean>({
    key: 'sidebarCollapsedAtom', // key phải là duy nhất trong toàn bộ app
    default: false,              // mặc định: sidebar đang mở
});

// ─── Atom: Todo App (Bài tập Recoil 6.3.3 nhưng áp dụng thực tế) ─────────
// Quản lý danh sách công việc cần làm của Admin (Admin Tasks)
export interface AdminTask {
    id: number;
    text: string;
    isCompleted: boolean;
}

export const adminTasksState = atom<AdminTask[]>({
    key: 'adminTasksState',
    default: [
        { id: 1, text: 'Kiểm tra hồ sơ bệnh án khoa Nhi', isCompleted: true },
        { id: 2, text: 'Lên lịch trực cho bác sĩ tuần tới', isCompleted: false },
        { id: 3, text: 'Phê duyệt yêu cầu xuất viện', isCompleted: false },
    ],
});

// ─── Atom: Search Keyword toàn cục ──────────────────────────────────────────────
// Dùng để chia sẻ keyword tìm kiếm giữa nhiều component (nếu cần)
export const globalSearchAtom = atom<string>({
    key: 'globalSearchAtom',
    default: '',
});

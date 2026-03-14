import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { adminTasksState, AdminTask } from '../../store/atoms';
import './AdminTasks.css';

export default function AdminTasks() {
    const [tasks, setTasks] = useRecoilState(adminTasksState);
    const [inputValue, setInputValue] = useState('');

    const addTask = () => {
        if (!inputValue.trim()) return;
        setTasks((oldTasks) => [
            ...oldTasks,
            {
                id: Date.now(),
                text: inputValue,
                isCompleted: false,
            },
        ]);
        setInputValue('');
    };

    const toggleTaskCompletion = (taskToToggle: AdminTask) => {
        setTasks((oldTasks) =>
            oldTasks.map((task) =>
                task.id === taskToToggle.id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    const deleteTask = (taskToDelete: AdminTask) => {
        setTasks((oldTasks) => oldTasks.filter((task) => task.id !== taskToDelete.id));
    };

    return (
        <div className="admin-tasks-wrap">
            <div className="admin-tasks-header">
                <h3>📋 Danh sách công việc cần làm (Todo)</h3>
                <span className="task-count">{tasks.filter(t => !t.isCompleted).length} việc tồn đọng</span>
            </div>
            
            <div className="admin-tasks-input">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Nhập công việc mới cần xử lý..."
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <button onClick={addTask}>Thêm</button>
            </div>

            <ul className="admin-tasks-list">
                {tasks.map((task) => (
                    <li key={task.id} className={task.isCompleted ? 'task-completed' : ''}>
                        <label className="task-label">
                            <input 
                                type="checkbox" 
                                checked={task.isCompleted} 
                                onChange={() => toggleTaskCompletion(task)} 
                            />
                            <span className="task-text">{task.text}</span>
                        </label>
                        <button className="task-delete-btn" onClick={() => deleteTask(task)}>Xóa</button>
                    </li>
                ))}
            </ul>
            
            {tasks.length === 0 && <p className="admin-tasks-empty">Hoan hô! Bạn đã hoàn thành tất cả công việc.</p>}
        </div>
    );
}

import { ReactNode } from 'react';
import './Table.css';

export interface TableColumn<T = Record<string, unknown>> {
    key?: string;
    title: string;
    dataIndex: keyof T;
    width?: string;
    render?: (value: T[keyof T], row: T, index: number) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    emptyText?: string;
    onRowClick?: (row: T) => void;
    rowKey?: keyof T;
}

export function Table<T extends Record<string, unknown>>({
    columns,
    data,
    loading = false,
    emptyText = 'Không có dữ liệu',
    onRowClick,
    rowKey = 'id' as keyof T,
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="table-loading">
                <i className="ti-reload spin" /> Đang tải...
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="art-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={col.key || String(col.dataIndex) || index} style={col.width ? { width: col.width } : {}}>
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="table-empty">
                                <i className="ti-info-alt" /> {emptyText}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={String(row[rowKey] ?? rowIndex)}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? 'clickable' : ''}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={col.key || String(col.dataIndex) || colIndex}>
                                        {col.render
                                            ? col.render(row[col.dataIndex], row, rowIndex)
                                            : String(row[col.dataIndex] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;

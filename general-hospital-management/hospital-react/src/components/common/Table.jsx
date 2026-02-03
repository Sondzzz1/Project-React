import './Table.css';

export function Table({
    columns,
    data,
    loading = false,
    emptyText = 'Không có dữ liệu',
    onRowClick,
    rowKey = 'id'
}) {
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
                            <th key={col.key || index} style={col.width ? { width: col.width } : {}}>
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
                                key={row[rowKey] || rowIndex}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? 'clickable' : ''}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={col.key || colIndex}>
                                        {col.render
                                            ? col.render(row[col.dataIndex], row, rowIndex)
                                            : row[col.dataIndex] || '-'
                                        }
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

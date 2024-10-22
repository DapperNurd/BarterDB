import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';

import styles from './Table.module.css';

export default function Table(props) {

    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState('');

    const title = props.title ?? "";

    const table = useReactTable({
        data: props.data,
        columns: props.columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting: sorting,
            globalFilter: filtering
        },
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setFiltering,
    });

    return (
        <div className={styles.wrapper}>
            <div className={styles.table_heading}>
                <h1>{title}</h1>
                <input type="text" placeholder='Search...' value={filtering ?? ""} onChange={(e) => { setFiltering(e.target.value); }} />
            </div>
            <table className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup, i) => { return (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, i) => ( // map over the headerGroup headers array
                                <th key={header.id}
                                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} 
                                    colSpan={header.colSpan} 
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {header.column.columnDef.header}
                                    {{asc: '🔼', desc: '🔽'}[header.column.getIsSorted() ?? null]}
                                </th>
                            ))}
                        </tr>
                    )})}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr>
                            {row.getVisibleCells().map((cell, i) => { return (
                                <td key={cell.id} 
                                    style={{width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined}}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            )})}
                        </tr>
                    ))}
                </tbody>
            </table>
            {table.getPageCount() > 1 && <div className={styles.pagination}>
                <button onClick={() => { table.setPageIndex(0) }}>{"<<"}</button>
                <button disabled={!table.getCanPreviousPage()} onClick={() => { table.previousPage(); }}>{"<"}</button>
                {`${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`}
                <button disabled={!table.getCanNextPage()} onClick={() => { table.nextPage(); }}>{">"}</button>
                <button onClick={() => { table.setPageIndex(table.getPageCount() - 1) }}>{">>"}</button>
            </div>}
        </div>
    );
}
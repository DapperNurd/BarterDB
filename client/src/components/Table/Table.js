import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';

import styles from './Table.module.css';

export default function Table(props) {

    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState('');

    const title = props.title ?? "";

    // What we are doing here is basically saying that if the showButtons prop is not passed, then we want to default to true and add the button column.
    const showButtons = props.showButtons ?? true;
    const columns = showButtons ? [...props.columns, 
        {
            accessorKey: 'test',
            header: 'Actions',
            cell: (props) => {
                return (
                    <div className={styles.table_buttons}>
                        <button onClick={() => {}}>Verify</button>
                        <button onClick={() => {}}>Delete</button>
                    </div>
                );
            },
        }]
        : props.columns;

    const table = useReactTable({
        data: props.data,
        columns: columns,
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
                                <th style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} key={header.id} colSpan={header.colSpan} onClick={header.column.getToggleSortingHandler()}>
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
                                <td key={cell.id} style={{textAlign: i === 0 ? 'center' : 'left', width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }} >
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
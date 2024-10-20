import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        columnResizeMode: "onChange",
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
            <table className={styles.table} style={{width: table.getCenterTotalSize()}}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => { return (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => ( // map over the headerGroup headers array
                                <th style={{width: header.getSize()}} key={header.id} colSpan={header.colSpan} onClick={header.column.getToggleSortingHandler()}>
                                    {header.column.columnDef.header}
                                    {header.column.getCanResize() && 
                                        <>
                                            <div
                                                onMouseDown={header.getResizeHandler()} 
                                                onTouchStart={header.getResizeHandler()} 
                                                className={`${styles.table_resizer} ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                                            />
                                            {{asc: '🔼', desc: '🔽'}[header.column.getIsSorted() ?? null]}
                                        </>
                                    }
                                </th>
                            ))}
                        </tr>
                    )})}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr>
                            {row.getVisibleCells().map(cell => { return (
                                <td style={{width: cell.column.getSize()}} key={cell.id}>
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
                {/* <Link to={table.getPreviousPageLink()}>&lt;</Link>
                <span>{table.getCurrentPage()}</span>
                <Link to={table.getNextPageLink()}>&gt;</Link> */}
            </div>}
        </div>
    );
}
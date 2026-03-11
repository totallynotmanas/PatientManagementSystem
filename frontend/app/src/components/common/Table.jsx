import React from 'react';

export const Table = ({ children, className = '' }) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                {children}
            </table>
        </div>
    );
};

export const TableHead = ({ children }) => {
    return (
        <thead className="bg-gray-50 dark:bg-slate-800/50">
            {children}
        </thead>
    );
};

export const TableBody = ({ children }) => {
    return (
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {children}
        </tbody>
    );
};

export const TableRow = ({ children, className = '', onClick }) => {
    return (
        <tr
            className={`transition-colors duration-200 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

export const TableHeader = ({ children, className = '', align = 'left' }) => {
    return (
        <th
            className={`px-6 py-3 text-${align} text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider ${className}`}
        >
            {children}
        </th>
    );
};

export const TableCell = ({ children, className = '', align = 'left' }) => {
    return (
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-${align} ${className}`}>
            {children}
        </td>
    );
};

export default Table;

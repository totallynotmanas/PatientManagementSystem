import React from 'react';

const Input = ({
    label,
    id,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block mb-2 text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                {...props}
            />
            {error && <p className="text-red-500 text-sm font-medium mt-1">{error}</p>}
        </div>
    );
};

export default Input;

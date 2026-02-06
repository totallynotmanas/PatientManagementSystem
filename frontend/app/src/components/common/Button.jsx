import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    fullWidth = false,
    ...props
}) => {
    const baseStyles = "py-3 px-4 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-blue-50 text-blue-600 border-2 border-blue-200 hover:bg-blue-100 focus:ring-blue-500",
        outline: "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

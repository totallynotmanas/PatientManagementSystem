import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const RestrictedSection = ({ children, allowedRoles = [], userRole, fallbackMessage = "Access Restricted" }) => {
    const [isHovered, setIsHovered] = useState(false);

    const hasAccess = allowedRoles.includes(userRole);

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <div
            className="relative group cursor-not-allowed"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="opacity-50 pointer-events-none filter blur-[1px]">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
          bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center 
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{fallbackMessage}</span>
                </div>
                {/* Always visible lock icon if not hovered, for cue */}
                {!isHovered && (
                    <div className="absolute top-2 right-2 text-gray-400">
                        <Lock className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestrictedSection;

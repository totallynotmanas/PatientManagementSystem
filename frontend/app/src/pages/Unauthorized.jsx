import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="text-center max-w-md w-full space-y-6">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="text-gray-600 dark:text-slate-400">
                        You do not have permission to view this page. This attempt has been logged.
                    </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-left text-sm space-y-2 shadow-sm">
                    <p className="font-medium text-gray-900 dark:text-white">Possible reasons:</p>
                    <ul className="list-disc list-inside text-gray-500 dark:text-slate-400 space-y-1">
                        <li>Your role does not authorize this action</li>
                        <li>Your session may have expired</li>
                        <li>The resource is restricted</li>
                    </ul>
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        leftIcon={ArrowLeft}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/login')}
                    >
                        Return to Login
                    </Button>
                </div>

                <p className="text-xs text-gray-400 dark:text-slate-600">
                    Error Code: 403_FORBIDDEN
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;

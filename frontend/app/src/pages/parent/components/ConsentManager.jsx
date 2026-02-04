import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';

const ConsentManager = () => {
    const [consents, setConsents] = useState([
        { id: 1, title: 'Data Sharing with Specialists', description: 'Allow primary doctor to share records with referred specialists.', granted: true },
        { id: 2, title: 'Research Participation', description: 'Allow anonymized data to be used for medical research.', granted: false },
        { id: 3, title: 'Emergency Access', description: 'Allow emergency responders temporary access to vitals and allergies.', granted: true },
    ]);

    const toggleConsent = (id) => {
        setConsents(consents.map(c =>
            c.id === id ? { ...c, granted: !c.granted } : c
        ));
    };

    return (
        <Card className="h-full">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Consent Management
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {consents.map(consent => (
                    <div key={consent.id} className="p-4 flex items-start justify-between">
                        <div className="pr-4">
                            <p className="font-medium text-gray-800">{consent.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{consent.description}</p>
                        </div>
                        <button
                            onClick={() => toggleConsent(consent.id)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.granted ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.granted ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
                Updates to consent settings are logged for security purposes.
            </div>
        </Card>
    );
};

export default ConsentManager;

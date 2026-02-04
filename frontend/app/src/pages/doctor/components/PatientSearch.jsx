import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const PatientSearch = ({ onSearch, searchTerm, setSearchTerm }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients by name, ID, or condition..."
                            className="pl-10 w-full border-2 border-gray-200 rounded-lg py-3 pr-4 focus:outline-none focus:border-blue-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex items-center justify-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button onClick={onSearch}>Search</Button>
                </div>
            </div>
        </div>
    );
};

export default PatientSearch;

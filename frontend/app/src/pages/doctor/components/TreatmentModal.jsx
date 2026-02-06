import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const TreatmentModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        frequency: '',
        notes: '',
        active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', frequency: '', notes: '', active: true });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Treatment' : 'Add New Treatment'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Treatment Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Physical Therapy"
                    required
                />
                <Input
                    label="Frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g. 2x Weekly"
                    required
                />
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Notes/Instructions</label>
                    <textarea
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional details..."
                    ></textarea>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">Treatment is currently active</label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Treatment</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TreatmentModal;

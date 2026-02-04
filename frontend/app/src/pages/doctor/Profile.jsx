import React, { useState } from 'react';
import { User, Mail, Phone, Award, Clock, Shield } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Doctor Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="p-6 lg:col-span-1 text-center">
                    <div className="w-32 h-32 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 font-bold text-4xl mb-4">
                        DS
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Dr. Sarah Smith</h3>
                    <p className="text-blue-600 font-medium">Cardiologist (MBBS, MD)</p>
                    <p className="text-gray-500 text-sm mt-1">License #MD-12345-NY</p>

                    <div className="mt-6 flex justify-center space-x-2">
                        <Badge type="green">Active Status</Badge>
                        <Badge type="blue">Verified</Badge>
                    </div>

                    <div className="mt-6 pt-6 border-t text-left space-y-3">
                        <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="w-4 h-4 mr-3" /> sarah.smith@medicare.com
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-3" /> +1 (555) 123-4567
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                            <Award className="w-4 h-4 mr-3" /> 15 Years Experience
                        </div>
                    </div>
                </Card>

                {/* Settings & Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-500" />
                                Personal Information
                            </h3>
                            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? 'Cancel' : 'Edit Details'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="Sarah" disabled={!isEditing} />
                            <Input label="Last Name" defaultValue="Smith" disabled={!isEditing} />
                            <Input label="Email" defaultValue="sarah.smith@medicare.com" disabled={!isEditing} />
                            <Input label="Phone" defaultValue="+1 (555) 123-4567" disabled={!isEditing} />
                            <div className="md:col-span-2">
                                <Input label="Clinic Address" defaultValue="123 Medical Center Dr, Suite 400" disabled={!isEditing} />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            Availability Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">Accepting New Patients</p>
                                    <p className="text-xs text-gray-500">Allow new patients to book appointments</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-blue-600 rounded-full cursor-pointer">
                                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform translate-x-6"></span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">Show Phone Number</p>
                                    <p className="text-xs text-gray-500">Display contact number on public profile</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-300 rounded-full cursor-pointer">
                                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform translate-x-0"></span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-500" />
                            Security
                        </h3>
                        <Button variant="secondary" className="w-full justify-center">Change Password</Button>
                        <Button variant="outline" className="w-full justify-center mt-3 text-red-600 border-red-200 hover:bg-red-50">Enable Two-Factor Authentication</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;

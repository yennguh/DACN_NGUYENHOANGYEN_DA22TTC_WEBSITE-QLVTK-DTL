import React from 'react';
import AdminSection from './components/AdminSection';
import { Building2, Mail, Phone, MapPin, Globe, Clock } from 'lucide-react';
import logoSchool from '../../public/assets/logo.jpg';

export default function SettingsSchool() {
    const schoolInfo = {
        name: 'Đại học Trà Vinh',
        nameEn: 'Tra Vinh University',
        shortName: 'TVU',
        address: '126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh, Tỉnh Trà Vinh',
        phone: '+84 294 3855 246',
        email: 'tvu@tvu.edu.vn',
        website: 'https://tvu.edu.vn',
        workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
        description: 'Trường Đại học Trà Vinh là cơ sở giáo dục đại học công lập, đào tạo đa ngành, đa lĩnh vực, có uy tín trong khu vực Đồng bằng sông Cửu Long.'
    };

    return (
        <AdminSection
            title="Thông tin trường"
        >
            <div className="space-y-6">
                {/* Logo và tên trường */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                            <img 
                                src={logoSchool} 
                                alt="Logo trường" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold">{schoolInfo.name}</h2>
                            <p className="text-blue-200 text-lg mt-1">{schoolInfo.nameEn}</p>
                            <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm font-medium">
                                {schoolInfo.shortName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin liên hệ */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-lg">Thông tin liên hệ</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ</p>
                                    <p className="text-gray-800">{schoolInfo.address}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Điện thoại</p>
                                    <p className="text-gray-800">{schoolInfo.phone}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-800">{schoolInfo.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Website</p>
                                    <a href={schoolInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {schoolInfo.website}
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Giờ làm việc</p>
                                    <p className="text-gray-800">{schoolInfo.workingHours}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Giới thiệu */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-lg">Giới thiệu</h3>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed">{schoolInfo.description}</p>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Hệ thống tìm đồ thất lạc</h4>
                            <p className="text-sm text-blue-600">
                                Kênh thông tin tra cứu đồ bị mất của học sinh, sinh viên Đại học Trà Vinh. 
                                Giúp kết nối người mất đồ và người nhặt được một cách nhanh chóng, hiệu quả.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bản đồ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-lg mb-4">Vị trí trên bản đồ</h3>
                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            title="Bản đồ Đại học Trà Vinh"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0!2d106.3!3d9.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTQnMDAuMCJOIDEwNsKwMTgnMDAuMCJF!5e0!3m2!1svi!2s!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </AdminSection>
    );
}


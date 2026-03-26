import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GatewayTable = () => {
    
    const [products, setProducts] = useState([
        { id: "P-101", name: "CRM Module", email: "AWS SES", sms: "Twilio", isActive: true },
        { id: "P-102", name: "HRMS System", email: "SendGrid", sms: "MSG91", isActive: false },
        { id: "P-103", name: "Billing Engine", email: "SMTP Relay", sms: "Fast2SMS", isActive: true },
        { id: "P-104", name: "Support Desk", email: "Mailgun", sms: "Vonage", isActive: true },
    ]);

    // Toggle Handler
    const handleToggle = (index) => {
        const updatedProducts = [...products];
        updatedProducts[index].isActive = !updatedProducts[index].isActive;
        setProducts(updatedProducts);
    };

    return (
        <div className="w-full">
            
            <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-left border-collapse table-auto">                    
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-4 ">
                            Product ID
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Product Name
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Email Gateway
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            SMS Gateway
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Gateway Status
                        </th>
                    </tr>
                </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((item, index) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {/* Product ID */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.id}
                                </td>

                                {/* Product Name */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {item.name}
                                </td>

                                {/* Email Gateway */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {item.email}
                                    </span>
                                </td>

                                {/* SMS Gateway */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        {item.sms}
                                    </span>
                                </td>

                                {/* Toggle Button Column */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div
                                        onClick={() => handleToggle(index)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <motion.span
                                            layout
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.isActive ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GatewayTable;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import DMS from './assests/DMS.jpg';
import UCS from './assests/UCS.jpg';
import HRMS from './assests/HRMS.jpg';
import PM from './assests/PurchaseModule.jpg';
import CRM from './assests/CRM.jpg';
import Access from './assests/Access.jpg';
import Logs from './assests/Logs.jpg';
import FB from './assests/FinancialBudget.jpg';
import UD from './assests/User Directory.jpg';
import ASM from './assests/Asset.jpg';

const allServices = [
    // { key: 'ORG', title: 'Organization Setup', img: HRMS, path: '/Organization' },
    { key: 'HRMS', title: '65.2.31.121rce Management System', img: HRMS, path: '/HRMS' },
    { key: 'UMC', title: 'User Directory', img: UD, path: '/Users' },
    { key: 'ASM', title: 'Asset Management System', img: ASM, path: '/RepoAllTab' },
    // { key: '', title: 'Document Management System', img: DMS, path: '/dms' },
    { key: 'CRM', title: 'Customer Relationship Management', img: CRM, path: '/TabNavigation' },
    { key: 'UCS', title: 'Communication Service', img: UCS, path: '/AllTabs' },
    { key: 'purchase_module', title: 'Purchase Module', img: PM, path: '/PurchaseModule' },
    { key: 'Budget', title: 'Financial Budget', img: FB, path: '/FinancialBudget' },
    { key: 'update_access', title: 'Access Privilege', img: Access, path: '/AccessPrivilege' },
    { key: 'LogsAccess', title: 'Logs', img: Logs, path: '/LogsPage' },
];

const CardsImagePart = () => {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccess = async () => {
            try {
                const token = sessionStorage.getItem('token'); // or sessionStorage
                const userId = sessionStorage.getItem('userId'); // make sure it's set
                const cardTitles = allServices.map((service) => service.key); // extract all keys

                const res = await axios.post('http://13.204.15.86:8336/access/verify-access',
                    {
                        user_id: parseInt(userId),
                        pages: cardTitles,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log('Access response:', res.data);

                // Optional: filter services based on access
                const allowedKeys = Object.keys(res.data).filter(key => res.data[key]);
                const filtered = allServices.filter(service => allowedKeys.includes(service.key));
                setServices(filtered);

            } catch (error) {
                console.error('Error fetching access:', error);
            }
        };

        fetchAccess();
    }, []);

    return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
                <div
                    key={index}
                    className="w-[300px] h-[200px] rounded-xl shadow-md overflow-hidden relative group cursor-pointer"
                    onClick={() => navigate(service.path)}
                >
                    <div className="w-full h-full overflow-hidden">
                        <img
                            src={service.img}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 transition-all duration-300 translate-y-0 group-hover:-translate-y-2">
                            <h3 className="text-sm font-semibold text-center">{service.title}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default CardsImagePart;
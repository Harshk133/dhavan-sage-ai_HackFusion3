import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const invRes = await axios.get('http://localhost:8000/inventory');
            setInventory(invRes.data);

            const alertRes = await axios.get('http://localhost:8000/alerts');
            setAlerts(alertRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center text-sm bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition"
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Alerts */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow border border-red-100 overflow-hidden">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-red-800 flex items-center">
                                <AlertCircle className="mr-2" size={20} />
                                Proactive Refill Alerts
                            </h2>
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{alerts.length}</span>
                        </div>
                        <div className="p-6">
                            {alerts.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No urgent refill alerts predicted at this time.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {alerts.map((alert, idx) => (
                                        <li key={idx} className="bg-red-50 p-4 rounded-lg border border-red-100">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-gray-900">{alert.user_name}</span>
                                                <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-0.5 rounded">
                                                    {alert.action_required}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">Needs <span className="font-semibold">{alert.medicine}</span>.</p>
                                            <p className="text-xs text-gray-500 mt-2">Predicted Depletion: {new Date(alert.depletion_date).toLocaleDateString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Inventory */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                        <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                                <Package className="mr-2" size={20} />
                                Live Inventory Status
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription Required</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {inventory.map((med, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${med.stock_level > 20 ? 'bg-green-100 text-green-800' :
                                                        med.stock_level > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {med.stock_level} units
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {med.prescription_required ? 'Yes' : 'No'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

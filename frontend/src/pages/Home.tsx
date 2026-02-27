import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="text-center py-20">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Next-Generation</span>
                <span className="block text-blue-600">Agentic Pharmacy AI</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                An autonomous, LangGraph-powered AI that seamlessly handles conversational ordering, enforces prescription safety checks, and proactively predicts medication refills.
            </p>

            <div className="mt-10 flex justify-center gap-4">
                <Link to="/chat" className="rounded-md shadow px-8 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Test Chatbot
                </Link>
                <Link to="/admin" className="rounded-md shadow px-8 py-3 bg-white text-blue-600 border border-transparent font-medium hover:bg-gray-50 transition border-blue-600">
                    Admin View
                </Link>
            </div>

            <div className="mt-20 border-t border-gray-200 pt-10 px-4 text-left grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div>
                    <h3 className="font-bold border-b pb-2 mb-2 text-blue-700 flex items-center"><span className="text-xl mr-2">🤖</span> Autonomous Routing</h3>
                    <p>Supervisor agent dynamically calls specialized tools for checking inventory and prescriptions.</p>
                </div>
                <div>
                    <h3 className="font-bold border-b pb-2 mb-2 text-green-700 flex items-center"><span className="text-xl mr-2">🛡️</span> Strict Guardrails</h3>
                    <p>LangChain logic absolutely blocks drug orders if stock is depleted or legally required prescriptions are missing.</p>
                </div>
                <div>
                    <h3 className="font-bold border-b pb-2 mb-2 text-yellow-600 flex items-center"><span className="text-xl mr-2">🔔</span> Proactive Alerts</h3>
                    <p>CRON jobs monitor user purchase history and calculate precise dates for predicting out-of-stock medication.</p>
                </div>
            </div>
        </div>
    );
}

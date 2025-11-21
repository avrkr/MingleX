import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/verify`, { email, code });
            setMessage('Email verified successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark text-white">
                <div className="text-center">
                    <p>No email provided. Please sign up first.</p>
                    <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-dark">
            <div className="w-full max-w-md p-8 space-y-6 bg-dark-light rounded-xl shadow-2xl border border-gray-800">
                {/* MingleX Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">MX</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        MingleX
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Connect, Chat, and Share</p>
                </div>

                <h2 className="text-3xl font-bold text-center text-white">Verify Email</h2>
                <p className="text-center text-gray-400">Enter the code sent to {email}</p>
                {error && <div className="p-3 text-sm text-red-500 bg-red-900/20 rounded border border-red-900">{error}</div>}
                {message && <div className="p-3 text-sm text-green-500 bg-green-900/20 rounded border border-green-900">{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                            placeholder="123456"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 font-semibold text-white bg-primary rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-primary/30"
                    >
                        Verify
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;

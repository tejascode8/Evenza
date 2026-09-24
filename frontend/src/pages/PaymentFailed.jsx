import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaRedoAlt, FaHome } from 'react-icons/fa';

const PaymentFailed = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative z-10">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 -z-10 animate-blob"></div>

            <div className="glass p-10 sm:p-14 rounded-[3rem] shadow-2xl max-w-lg w-full text-center border border-white/50 relative overflow-hidden animate-scale-in">
                {/* Top border highlight */}
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-rose-400 to-rose-600"></div>

                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-rose-400 blur-2xl opacity-40 rounded-full"></div>
                    <FaTimesCircle className="relative text-rose-500 text-8xl mx-auto drop-shadow-md animate-pulse" style={{ animationDuration: '2s' }} />
                </div>

                <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 mb-4 tracking-tight">Booking Failed</h1>
                <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                    We couldn't process your payment. Please ensure your payment details are correct and try again.
                </p>

                <div className="space-y-4 flex flex-col items-center">
                    <Link to="/" className="w-full sm:w-11/12 group flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-1 text-lg">
                        <FaRedoAlt className="text-rose-100 group-hover:rotate-180 transition-transform duration-500" />
                        Try Again
                    </Link>
                    <Link to="/dashboard" className="w-full sm:w-11/12 flex items-center justify-center gap-3 bg-white/50 hover:bg-white text-slate-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
                        <FaHome className="text-slate-400" />
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;

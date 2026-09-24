import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt, FaArrowRight } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative z-10">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 -z-10 animate-blob"></div>
            
            <div className="glass p-10 sm:p-14 rounded-[3rem] shadow-2xl max-w-lg w-full text-center border border-white/50 relative overflow-hidden animate-scale-in">
                {/* Top border highlight */}
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 rounded-full"></div>
                    <FaCheckCircle className="relative text-emerald-500 text-8xl mx-auto drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h1>
                <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                    Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.
                </p>
                
                <div className="space-y-4 flex flex-col items-center">
                    <Link to="/dashboard" className="w-full sm:w-11/12 group flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-1 text-lg">
                        <FaTicketAlt className="text-emerald-100 group-hover:scale-110 transition-transform" />
                        View My Tickets
                        <FaArrowRight className="text-sm opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                    <Link to="/" className="w-full sm:w-11/12 bg-white/50 hover:bg-white text-slate-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

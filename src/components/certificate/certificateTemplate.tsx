import React from 'react';
import { GiLaurelsTrophy } from "react-icons/gi";

interface CertificateProps {
    id: string;
    title: string;
    issueDate: string;
    courseId: string;
    thumbnail: string;
    duration: string;
    level: string;
    userName: string;
    courseName?: string;
}

const CertificateTemplate: React.FC<CertificateProps> = ({
    id,
    title,
    issueDate,
    courseId,
    thumbnail,
    duration,
    level,
    userName,
    courseName = "Loading Course Name...",
}) => {
    return (
        <div 
            className="relative mx-auto bg-white border-8 border-double border-blue-600 rounded-md shadow-[0_10px_30px_rgba(79,70,229,0.3)] overflow-hidden font-serif w-[90vw] max-w-[900px] aspect-[3/2]"
            style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: '#ffffff',
                border: '8px double #2563eb',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)',
                overflow: 'hidden',
                fontFamily: 'serif',
                width: '90vw',
                maxWidth: '900px',
                aspectRatio: '3/2'
            }}
        >
            {/* Inline CSS for Background Pattern and Print Styles */}
            <style>
                {`
                    .bg-star-pattern {
                        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L12 8H20L13 13L15 20L10 15L5 20L7 13L0 8H8L10 0Z' fill='%23C7D2FE' fill-opacity='0.1'/%3E%3C/svg%3E");
                        background-repeat: repeat;
                        background-color: transparent;
                    }
                    
                    @media print {
                        .trophy-icon {
                            color: #2563eb !important;
                            display: block !important;
                            visibility: visible !important;
                        }
                        .bg-star-pattern {
                            background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L12 8H20L13 13L15 20L10 15L5 20L7 13L0 8H8L10 0Z' fill='%23C7D2FE' fill-opacity='0.1'/%3E%3C/svg%3E") !important;
                            background-repeat: repeat !important;
                        }
                    }

                    @media (max-width: 640px) {
                        .certificate-container {
                            transform: scale(0.8);
                            transform-origin: top;
                        }
                    }

                    @media (max-width: 480px) {
                        .certificate-container {
                            transform: scale(0.6);
                            transform-origin: top;
                        }
                    }
                `}
            </style>

            {/* Background Gradient */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eff6ff)',
                    opacity: '0.7'
                }}
            />

            {/* Background Pattern */}
            <div 
                className="absolute inset-0 bg-star-pattern opacity-20"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    opacity: '0.2'
                }}
            />

            {/* Main Content */}
            <div 
                className="certificate-container relative flex flex-col items-center justify-between h-full p-6 sm:p-8 md:p-12 text-gray-700 text-base"
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '100%',
                    padding: '3rem',
                    color: '#374151',
                    fontSize: '1rem'
                }}
            >
                {/* Header Section */}
                <div 
                    className="text-center"
                    style={{ textAlign: 'center' }}
                >
                    <div 
                        className="trophy-icon mx-auto mb-2 sm:mb-4"
                        style={{
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginBottom: '1rem',
                            color: '#2563eb',
                            width: '4rem',
                            height: '4rem'
                        }}
                    >
                        <GiLaurelsTrophy size={64} />
                    </div>
                    <h1 
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight"
                        style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: '#1e40af',
                            letterSpacing: '-0.025em'
                        }}
                    >
                        Certificate of Excellence
                    </h1>
                </div>

                {/* Central Content */}
                <div 
                    className="text-center space-y-2 sm:space-y-4"
                    style={{
                        textAlign: 'center',
                        marginTop: '0.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    <p 
                        className="font-medium mt-2 text-sm sm:text-base"
                        style={{
                            fontWeight: '500',
                            marginTop: '0.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        Proudly Presented to
                    </p>
                    <h2 
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 border-b-4 border-blue-300 inline-block pb-2 px-4 sm:px-6 md:px-8 mx-4 rounded-sm"
                        style={{
                            fontSize: '2.25rem',
                            fontWeight: '700',
                            color: '#1d4ed8',
                            borderBottom: '4px solid #93c5fd',
                            display: 'inline-block',
                            paddingBottom: '0.5rem',
                            paddingLeft: '2rem',
                            paddingRight: '2rem',
                            marginLeft: '1rem',
                            marginRight: '1rem',
                            borderRadius: '0.125rem'
                        }}
                    >
                        {userName}
                    </h2>
                    <p 
                        className="font-medium text-sm sm:text-base"
                        style={{ 
                            fontWeight: '500',
                            fontSize: '1rem'
                        }}
                    >
                        for outstanding completion of the {level} level course
                    </p>
                    <h3 
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-800 tracking-tight"
                        style={{
                            fontSize: '2.25rem',
                            fontWeight: '600',
                            color: '#1d4ed8',
                            letterSpacing: '-0.025em'
                        }}
                    >
                        &quot;{title}&quot;
                    </h3>
                    <p 
                        className="max-w-lg mx-auto leading-relaxed text-sm sm:text-base"
                        style={{
                            maxWidth: '32rem',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            lineHeight: '1.75',
                            fontSize: '1rem'
                        }}
                    >
                        This <span className="font-bold text-blue-800" style={{ fontWeight: '700', color: '#1d4ed8' }}>{duration}</span> journey exemplifies dedication, skill, and a commitment to advancing expertise in {courseName}.
                    </p>
                </div>

                {/* Details Section */}
                <div 
                    className="w-full flex flex-col sm:flex-row justify-between items-end text-xs font-medium"
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}
                >
                    <div 
                        className="space-y-2 bg-blue-50 p-4 rounded-md shadow-sm mb-4 sm:mb-0"
                        style={{
                            marginBottom: '0.5rem',
                            backgroundColor: '#eff6ff',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <p 
                            className="text-blue-800"
                            style={{ color: '#2563eb' }}
                        >
                            Certificate ID: <span className="font-semibold" style={{ fontWeight: '600' }}>{id}</span>
                        </p>
                        <p 
                            className="text-blue-800"
                            style={{ color: '#2563eb' }}
                        >
                            Course ID: <span className="font-semibold" style={{ fontWeight: '600' }}>{courseId}</span>
                        </p>
                    </div>
                    <div 
                        className="text-left sm:text-right space-y-2 bg-blue-50 p-4 rounded-md shadow-sm"
                        style={{
                            textAlign: 'right',
                            marginBottom: '0.5rem',
                            backgroundColor: '#eff6ff',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <p 
                            className="text-blue-800"
                            style={{ color: '#2563eb' }}
                        >
                            Issued on: <span className="font-semibold" style={{ fontWeight: '600' }}>{issueDate}</span>
                        </p>
                        <p 
                            className="text-blue-800"
                            style={{ color: '#2563eb' }}
                        >
                            Duration: <span className="font-semibold" style={{ fontWeight: '600' }}>{duration}</span>
                        </p>
                        <p 
                            className="text-blue-800"
                            style={{ color: '#2563eb' }}
                        >
                            Level: <span className="font-semibold" style={{ fontWeight: '600' }}>{level}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div 
                className="absolute top-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-500 rounded-br-full opacity-40 transform -translate-x-4 sm:-translate-x-8 -translate-y-4 sm:-translate-y-8"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '6rem',
                    height: '6rem',
                    background: 'linear-gradient(to bottom right, #3b82f6, #3b82f6)',
                    borderBottomRightRadius: '9999px',
                    opacity: '0.4',
                    transform: 'translate(-2rem, -2rem)'
                }}
            />
            <div 
                className="absolute bottom-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-tl from-blue-500 to-blue-500 rounded-tl-full opacity-40 transform translate-x-4 sm:translate-x-8 translate-y-4 sm:translate-y-8"
                style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '6rem',
                    height: '6rem',
                    background: 'linear-gradient(to top left, #3b82f6, #3b82f6)',
                    borderTopLeftRadius: '9999px',
                    opacity: '0.4',
                    transform: 'translate(2rem, 2rem)'
                }}
            />
            <div 
                className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 sm:w-14 h-10 sm:h-14 border-2 border-blue-400 rounded-full animate-pulse"
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '3.5rem',
                    height: '3.5rem',
                    border: '2px solid #60a5fa',
                    borderRadius: '9999px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
            />
            <div 
                className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-10 sm:w-14 h-10 sm:h-14 border-2 border-blue-400 rounded-full animate-pulse"
                style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    width: '3.5rem',
                    height: '3.5rem',
                    border: '2px solid #60a5fa',
                    borderRadius: '9999px',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
            />
        </div>
    );
};

export default CertificateTemplate;
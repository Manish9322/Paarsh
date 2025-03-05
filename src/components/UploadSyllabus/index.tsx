import React, { useState, useRef } from 'react';

const UploadSyllabusButton: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            onFileSelect(selectedFile); // Pass the selected file to the parent
        } else {
            alert('Please select a valid PDF file.');
        }
    };

    const openFileExplorer = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-fit container">
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }} // Hide the input
            />
            <button
                onClick={openFileExplorer}
                className="bg-blue-600 w-full dark:text-white mb-4 px-3  py-2 rounded text-white hover:bg-black transition "
            >
                Upload Syllabus
            </button>
        </div>
    );
};

export default UploadSyllabusButton;
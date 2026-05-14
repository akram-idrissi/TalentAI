import axios from 'axios';
import React, { useState } from 'react';

interface UploadProps {
    candidateId: number;
    briefId: number;
}

const InterviewUpload: React.FC<UploadProps> = ({ candidateId, briefId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] || null);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('candidate_id', candidateId.toString());
        formData.append('brief_id', briefId.toString());

        try {
            setUploading(true);
            setStatus('AI is transcribing... Please wait.');

            const response = await axios.post('/interviews/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Success:', response.data);
            setStatus('Done! Transcription ready.');
        } catch (error) {
            console.error('Error:', error);
            setStatus('Error during transcription.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-800">
                Upload Interview (3.1)
            </h3>

            <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-500
                file:mr-4 file:rounded-full file:border-0
                file:bg-blue-50 file:px-4 file:py-2
                file:text-sm file:font-semibold
                file:text-blue-700 hover:file:bg-blue-100"
            />

            <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full rounded-lg py-2 font-bold text-white transition-all ${
                    uploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {uploading ? 'Processing...' : 'Analyze Interview'}
            </button>

            {status && (
                <p
                    className={`mt-4 text-sm ${
                        status.includes('Error')
                            ? 'text-red-600'
                            : 'text-green-600'
                    }`}
                >
                    {status}
                </p>
            )}
        </div>
    );
};

export default InterviewUpload;
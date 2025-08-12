import React, { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { emailVerification } from '../utils/api';

interface MailVerificationProps {
    emailVeifyToken: string;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const MailVerification: React.FC<MailVerificationProps> = ({ emailVeifyToken, onSuccess, onError }) => {
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!emailVeifyToken) {
                setIsVerifying(false);
                return;
            }

            try {
                const response = await emailVerification(emailVeifyToken);

                if (response.valid) {
                    onSuccess('Email verified successfully!');
                } else {
                    onError('Email failed to verify');
                }
            } catch (error) {
                onError('Network error during email verification');
            } finally {
                setIsVerifying(false);
                // Redirect to base URL after verification attempt
                setTimeout(() => {
                    window.location.href = window.location.origin;
                }, 2000);
            }
        };

        verifyToken();
    }, [emailVeifyToken, onSuccess, onError]);

    if (!emailVeifyToken) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Verifying Token
                </h1>

                {isVerifying ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-gray-600">Verifying your token...</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Please wait while we verify your authentication token.
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-600">
                        Redirecting you back to the main page...
                    </p>
                )}
            </div>
        </div>
    );
};

export default MailVerification;
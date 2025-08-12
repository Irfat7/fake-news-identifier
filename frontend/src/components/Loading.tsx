import { useState, useEffect } from "react";
import { Server, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

type ServiceStatus = {
    name: string;
    url: string;
    status: "pending" | "loading" | "ready" | "error";
    critical: boolean
};

const initialServices: ServiceStatus[] = [
    { name: "Express API", url: "https://fake-news-identifier.onrender.com/health", status: "pending", critical: true },
    { name: "Worker Service", url: "https://fake-news-identifier-combined-workers.onrender.com/health", status: "pending", critical: false },
    { name: "Prometheus", url: "https://fake-news-identifier-prometheus.onrender.com/-/healthy", status: "pending", critical: false },
    { name: "Flask API", url: "https://fake-news-identifier-flask-ml.onrender.com/health", status: "pending", critical: true },
];

interface LoadingProps {
    allReady: boolean;
    setHasCriticalError: (staus: boolean) => void;
    setAllReady: (status: boolean) => void
}

const Loading: React.FC<LoadingProps> = ({ allReady, setHasCriticalError, setAllReady }) => {
    const [services, setServices] = useState<ServiceStatus[]>(initialServices);

    useEffect(() => {
        initialServices.forEach(async (service) => {
            setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "loading" } : s));
            try {
                await fetch(service.url, { method: "GET", mode: "no-cors" });
                setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "ready" } : s));
            } catch {
                if (service.critical) {
                    setHasCriticalError(true);
                }
                setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "error" } : s));
            }
        });
    }, []);

    useEffect(() => {
        if (services.every(s => s.status === "ready")) {
            setAllReady(true);
        }
    }, [services]);

    const getStatusIcon = (status: ServiceStatus['status']) => {
        switch (status) {
            case "pending":
                return <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />;
            case "loading":
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case "ready":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusText = (status: ServiceStatus['status']) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "loading":
                return "Connecting...";
            case "ready":
                return "Ready";
            case "error":
                return "Failed";
        }
    };

    const getStatusColor = (status: ServiceStatus['status']) => {
        switch (status) {
            case "pending":
                return "text-gray-500";
            case "loading":
                return "text-blue-600";
            case "ready":
                return "text-green-600";
            case "error":
                return "text-red-600";
        }
    };

    const readyCount = services.filter(s => s.status === "ready").length;
    const totalServices = services.length;
    const progressPercentage = (readyCount / totalServices) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        🧠 Fake News Detector
                    </h1>
                    <p className="text-gray-600">
                        {allReady ? "All systems ready!" : "Initializing services..."}
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {!allReady ? (
                        <>
                            {/* Progress Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Server className="w-5 h-5 text-blue-600" />
                                        Service Status
                                    </h2>
                                    <span className="text-sm font-medium text-gray-600">
                                        {readyCount}/{totalServices}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Services List */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <div
                                            key={service.name}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(service.status)}
                                                <div>
                                                    <p className="font-medium text-gray-900">{service.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-48">
                                                        {service.url}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                                                {getStatusText(service.status)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Loading Message */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">
                                        Please wait while we wake up the services...
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        This may take a few moments on first load
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                                        💤 Deployed using free tier - services may take up to 50+ seconds to wake up from sleep
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* All Ready State */
                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                All Systems Ready!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                All services are online and ready to process your requests.
                            </p>

                            {/* Final Loading Spinner */}
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-600">Loading application...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        Powered by Express.js, Flask, and advanced ML models
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Loading;
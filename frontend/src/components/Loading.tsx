import { useState, useEffect } from "react";

type ServiceStatus = {
    name: string;
    url: string;
    status: "pending" | "loading" | "ready" | "error";
};

const initialServices: ServiceStatus[] = [
    { name: "Express API", url: "https://fake-news-identifier.onrender.com/health", status: "pending" },
    { name: "Worker Service", url: "https://fake-news-identifier-combined-workers.onrender.com/health", status: "pending" },
    { name: "Prometheus", url: "https://fake-news-identifier-prometheus.onrender.com/health", status: "pending" },
    { name: "Flask API", url: "https://fake-news-identifier-flask-ml.onrender.com/health", status: "pending" },
    /* { name: "PostgreSQL DB", url: "https://fake-news-identifier-db.onrender.com", status: "pending" } */
];

interface LoadingProps {
    allReady: boolean;
    setAllReady: (status: boolean) => void
}

const Loading: React.FC<LoadingProps> = ({ allReady, setAllReady }) => {
    const [services, setServices] = useState<ServiceStatus[]>(initialServices);

    useEffect(() => {
        initialServices.forEach(async (service) => {
            setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "loading" } : s));
            try {
                await fetch(service.url, { method: "GET", mode: "no-cors" });
                setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "ready" } : s));
            } catch {
                setServices(prev => prev.map(s => s.name === service.name ? { ...s, status: "error" } : s));
            }
        });
    }, []);

    useEffect(() => {
        if (services.every(s => s.status === "ready")) {
            setAllReady(true);
        }
    }, [services]);

    if (!allReady) {
        return (
            <div style={{ padding: "20px" }}>
                <h2>Waking up services...</h2>
                <ul>
                    {services.map(s => (
                        <li key={s.name}>
                            {s.name} → {s.status === "pending" && "Pending"}
                            {s.status === "loading" && "Loading..."}
                            {s.status === "ready" && "✅ Ready"}
                            {s.status === "error" && "❌ Error"}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
};

export default Loading;
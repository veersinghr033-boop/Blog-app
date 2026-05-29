"use client";

import ReportCard from "@/components/ui/ReportCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useEffect } from "react";
import { message, Spin } from "antd";

export default function Page() {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["report"],
        queryFn: async () => {
            const response = await api.get("/reports/report");
            return response.data.reports;
        },
    });

    useEffect(() => {
        if (isError) {
            console.error("Error fetching reports:", error);
            message.error("Failed to fetch reports");
        }
    }, [isError, error]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <ReportCard data={data} />
        </div>
    );
}


"use client"

import ReportCard from "@/components/ui/ReportCard"
import { useQuery } from "@tanstack/react-query"
import api from "@/utills/axios"
import { useEffect } from "react"
import { message } from "antd"

export default function page() {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["reports"],
        queryFn: async () => {
            const response = await api.get("/reports")
            return response.data.reports
        },
    })
    useEffect(() => {
        if (isError) {
            console.error("Error fetching reports:", error)
            message.error("Failed to fetch reports")
        }
    }, [isError, error])
    console.log("Reports data:", data)
    return (
        <div>
            <ReportCard data={data} />
        </div>
    )
}

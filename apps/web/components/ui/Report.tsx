"use client";

import { useState } from "react";
import { Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import {toast} from "sonner";

interface ReportModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    blogId: string;
}

function ReportModal({
    open,
    setOpen,
    blogId,
}: ReportModalProps) {
    const queryClient = useQueryClient();

    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const reportMutation = useMutation({
        mutationFn: async (reason: string) => {
            return api.post("/reports", {
                blogId,
                reason,
            });
        },

        onSuccess: () => {
            toast.success("Blog reported successfully");

            queryClient.invalidateQueries({
                queryKey: ["reportUser", blogId],
            });
            queryClient.invalidateQueries({
                queryKey: ["report"],
            });
            queryClient.invalidateQueries({
                queryKey: ["reports"],
            });

            setReason("");
            setError("");
            setOpen(false);
        },

        onError: (error) => {
            console.error(error);
            toast.error("Failed to report blog");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError("Please provide a reason");
            return;
        }

        if (reason.trim().length < 10) {
            setError("Reason must be at least 10 characters");
            return;
        }

        setError("");
        reportMutation.mutate(reason);
    };

    const handleClose = () => {
        setReason("");
        setError("");
        setOpen(false);
    };

    return (
        <Modal
            title="Report Blog"
            open={open}
            onCancel={handleClose}
            footer={null}
        >
            <p className="mb-4">
                Are you sure you want to report this blog?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="reason"
                        className="mb-2 block font-medium"
                    >
                        Reason
                    </label>

                    <textarea
                        id="reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason for reporting this blog"
                        className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-blue-500"
                    />

                    {error && (
                        <p className="mt-1 text-sm text-red-500">{error}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={reportMutation.isPending}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                        {reportMutation.isPending
                            ? "Reporting..."
                            : "Yes, Report"}
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md border border-gray-300 px-4 py-2"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ReportModal;
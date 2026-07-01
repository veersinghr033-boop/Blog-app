"use client"

import { ReactNode } from "react"

export default function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative h-full w-[80%] bg-white shadow-xl">
                <div className="p-4 border-b flex justify-end">
                    <button onClick={onClose} aria-label="Close" className="text-gray-600">Close</button>
                </div>
                <div className="p-4 overflow-auto h-[calc(100%-56px)]">{children}</div>
            </div>
        </div>
    )
}

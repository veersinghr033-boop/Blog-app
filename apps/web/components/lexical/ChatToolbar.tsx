"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    TextFormatType
} from "lexical";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Props {
    isVisible: boolean;
}

export default function ChatToolbar({ isVisible }: Props) {
    const [editor] = useLexicalComposerContext();
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setPosition({
                top: rect.top - 60,
                left: rect.left + rect.width / 2,
            });
        };

        updatePosition();
        window.addEventListener("selectionchange", updatePosition);

        return () => {
            window.removeEventListener("selectionchange", updatePosition);
        };
    }, [isVisible]);

    const handleFormat = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const insertList = (listType: "bullet" | "number") => {
        editor.dispatchCommand(
            listType === "bullet"
                ? INSERT_UNORDERED_LIST_COMMAND
                : INSERT_ORDERED_LIST_COMMAND,
            undefined
        );
    };

    const buttonClass =
        "p-2 rounded hover:bg-gray-700 transition-colors border border-gray-500 bg-gray-600 text-white hover:bg-gray-700 text-sm flex items-center justify-center";

    if (!isVisible) return null;

    return (
        <div
            ref={toolbarRef}
            className="fixed z-50 flex items-center gap-1 p-2 bg-gray-200 border border-gray-400 rounded-lg shadow-lg"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: "translateX(-50%)",
                pointerEvents: "auto",
            }}
        >
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat("bold");
                }}
                className={buttonClass}
                title="Bold"
            >
                <Bold size={16} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat("italic");
                }}
                className={buttonClass}
                title="Italic"
            >
                <Italic size={16} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat("underline");
                }}
                className={buttonClass}
                title="Underline"
            >
                <Underline size={16} />
            </button>

            <div className="w-px h-5 bg-gray-600"></div>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    insertList("bullet");
                }}
                className={buttonClass}
                title="Unordered List"
            >
                <List size={16} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    insertList("number");
                }}
                className={buttonClass}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
        </div>
    );
}

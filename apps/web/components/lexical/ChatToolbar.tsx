"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    TextFormatType,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_LOW,
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
    const [formats, setFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
    });
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
    const updateFormats = () => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
                setFormats({
                    bold: selection.hasFormat("bold"),
                    italic: selection.hasFormat("italic"),
                    underline: selection.hasFormat("underline"),
                });
            }
        });
    };
    const handleFormat = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);

        setTimeout(() => {
            updateFormats();
        }, 0);
    };
    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateFormats();
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);
    const insertList = (listType: "bullet" | "number") => {
        editor.dispatchCommand(
            listType === "bullet"
                ? INSERT_UNORDERED_LIST_COMMAND
                : INSERT_ORDERED_LIST_COMMAND,
            undefined
        );
    };
    const buttonClass =
        "p-2 rounded border border-gray-500 dark:border-zinc-700 bg-gray-600 dark:bg-zinc-800 text-white hover:bg-gray-700 dark:hover:bg-zinc-700 transition-colors text-sm flex items-center justify-center";

    if (!isVisible) return null;

    return (
        <div
            ref={toolbarRef}
            className="fixed z-50 flex items-center gap-1 p-2 bg-gray-200 dark:bg-zinc-900 border border-gray-400 dark:border-zinc-700 rounded-lg shadow-lg"
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
                title="Bold"
                className={`${buttonClass} ${formats.bold ? "bg-blue-500! border-blue-500!" : ""
                    }`}
            >
                <Bold size={16} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat("italic");
                }}
                title="Italic"
                className={`${buttonClass} ${formats.italic ? "bg-blue-500! border-blue-500!" : ""
                    }`}
            >
                <Italic size={16} />
            </button>

            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat("underline");
                }}
                title="Underline"
                className={`${buttonClass} ${formats.underline ? "bg-blue-500! border-blue-500!" : ""
                    }`}
            >
                <Underline size={16} />
            </button>

            <div className="w-px h-5 bg-gray-600 dark:bg-zinc-600"></div>

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

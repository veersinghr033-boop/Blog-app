"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_LOW,
    $createParagraphNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
    $createHeadingNode,
    $createQuoteNode,
} from "@lexical/rich-text";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";


export default function Toolbar() {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");
    const [fontSize, setFontSize] = useState("16px");
    const [formats, setFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
    });
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) return;

                const anchorNode = selection.anchor.getNode();
                const topLevelElement =
                    anchorNode.getTopLevelElementOrThrow();

                if (topLevelElement.getType() === "heading") {
                    setBlockType(
                        (topLevelElement as any).getTag()
                    );
                } else {
                    setBlockType(topLevelElement.getType());
                }                const style = anchorNode.getStyle?.();

                const match = style?.match(/font-size:\s*([^;]+)/);

                if (match) {
                    setFontSize(match[1]);
                } else {
                    setFontSize("16px");
                }
            });
        });
    }, [editor]);
    const changeBlockType = (value: string) => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) return;

            switch (value) {
                case "paragraph":
                    $setBlocksType(selection, () =>
                        $createParagraphNode()
                    );
                    break;

                case "h1":
                    $setBlocksType(selection, () =>
                        $createHeadingNode("h1")
                    );
                    break;

                case "h2":
                    $setBlocksType(selection, () =>
                        $createHeadingNode("h2")
                    );
                    break;

                case "h3":
                    $setBlocksType(selection, () =>
                        $createHeadingNode("h3")
                    );
                    break;

               

            }
        });
    };
    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
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

                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);
    const applyFontSize = (size: string) => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) return;

            selection.getNodes().forEach((node: any) => {
                if (node.setStyle) {
                    node.setStyle(`font-size:${size}`);
                }
            });
        });
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
        "py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-500 bg-gray-600 text-white hover:bg-gray-700 text-sm flex items-center justify-center";

    return (
        <div className="flex items-center gap-2 p-2 border-b bg-gray-200 border-gray-400">
            <select
                value={blockType}
                className="border rounded px-3 py-2 border-gray-400"
                onChange={(e) => changeBlockType(e.target.value)}
            >
                <option value="paragraph">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
            </select>

            <select
                className="border rounded px-3 py-2 border-gray-400"
                value={fontSize}
                onChange={(e) => applyFontSize(e.target.value)}
            >
                <option>Font Size</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="20px">20</option>
                <option value="24px">24</option>
                <option value="28px">28</option>
                <option value="32px">32</option>
            </select>

            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "bold"
                    )
                }
                title="Bold"
                className={`${buttonClass} ${formats.bold
                    ? "bg-blue-500! border-blue-500!"
                    : ""
                    }`}            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "italic"
                    )
                }
                title="Italic"
                className={`${buttonClass} ${formats.italic
                    ? "bg-blue-500! border-blue-500!"
                    : ""
                    } `}
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "underline"
                    )
                }
                title="Underline"
                className={`${buttonClass} ${formats.underline
                    ? "bg-blue-500! border-blue-500!"
                    : ""
                    }`}
            >
                <Underline size={16} />
            </button>
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
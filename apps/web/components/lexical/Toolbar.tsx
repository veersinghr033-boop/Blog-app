"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
    $createHeadingNode,
    $createQuoteNode,
} from "@lexical/rich-text";


import { $createParagraphNode } from "lexical";

export default function Toolbar() {
    const [editor] = useLexicalComposerContext();

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

                case "quote":
                    $setBlocksType(selection, () =>
                        $createQuoteNode()
                    );
                    break;
                
            }
        });
    };

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

   

    return (
        <div className="flex items-center gap-2 p-2 border-b">
            <select
                className="border rounded px-3 py-2"
                onChange={(e) => changeBlockType(e.target.value)}
            >
                <option value="paragraph">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="quote">Quote</option>
                <option value="code">Code Block</option>
            </select>

            <select
                className="border rounded px-3 py-2"
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
            >
                B
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "italic"
                    )
                }
            >
                I
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "underline"
                    )
                }
            >
                U
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "strikethrough"
                    )
                }
            >
                S
            </button>

           
        </div>
    );
}
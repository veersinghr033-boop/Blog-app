"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import ChatToolbar from "./ChatToolbar";
import SelectionPlugin from "./plugins/SelectionPlugin";
import KeyboardPlugin from "./plugins/KeyboardPlugin";
import chatTheme from "./chatTheme";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import OnChangePlugin from "./plugins/OnChangePlugin";
import { useState, useEffect } from "react";
const initialConfig = {
    namespace: "ChatEditor",
    theme: chatTheme,
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
    ],
    onError(error: Error) {
        console.error("Editor error:", error);
    },
};

interface Props {
    value: string;
    onChange: (value: any) => void;
    onEnter?: () => void;
    placeholder?: string;
}

export default function ChatEditor({
    value,
    onChange,
    onEnter,
    placeholder = "Type a message...",
}: Props) {
    const [showToolbar, setShowToolbar] = useState(false);

  

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="border border-gray-400 rounded-lg  relative overflow-hidden max-h-15 flex-1">
                <ChatToolbar isVisible={showToolbar} />

                <div className="px-4 py-2">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="outline-none overflow-y-auto resize-none " />
                        }
                        placeholder={
                            <div className="text-gray-500 absolute top-2 left-4 pointer-events-none text-sm">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={() => null}
                    />
                    <HistoryPlugin />
                    <OnChangePlugin onChange={onChange} />
                    {onEnter && <KeyboardPlugin onEnter={onEnter} />}
                    <SelectionPlugin onSelectionChange={setShowToolbar} />
                </div>
            </div>
        </LexicalComposer>
    );
}

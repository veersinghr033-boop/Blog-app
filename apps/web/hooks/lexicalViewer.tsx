"use client";

import React, { memo, useEffect, useMemo, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import chatTheme from "@/components/lexical/chatTheme";

const editorConfig = {
    namespace: "MessageViewer",
    theme: chatTheme,
    editable: false,
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
    ],
    onError(error: Error) {
        console.error(error);
    },
};

function LoadState({
    serializedValue,
}: {
    serializedValue: string;
}) {
    const [editor] = useLexicalComposerContext();
    const previousValue = useRef("");

    useEffect(() => {
        if (!serializedValue) return;

        // Skip if same content
        if (previousValue.current === serializedValue) return;

        previousValue.current = serializedValue;

        editor.setEditable(false);

        try {
            const editorState = editor.parseEditorState(serializedValue);
            editor.setEditorState(editorState);
        } catch (err) {
            console.error("Failed to parse Lexical state", err);
        }
    }, [editor, serializedValue]);

    return null;
}

interface Props {
    value: any;
}

function LexicalViewer({ value }: Props) {
    const serializedValue = useMemo(() => {
        if (!value) return "";
        return JSON.stringify(value);
    }, [value]);

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable className="outline-none pointer-events-none" />
                }
                placeholder={null}
                ErrorBoundary={() => null}
            />

            <LoadState serializedValue={serializedValue} />
        </LexicalComposer>
    );
}

export default memo(LexicalViewer);
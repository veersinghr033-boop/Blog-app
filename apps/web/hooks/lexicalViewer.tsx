"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import chatTheme from "@/components/lexical/chatTheme";

function LoadState({ value }: { value: any }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!value) return;

        editor.setEditable(false);

        editor.update(() => {
            if (value && Object.keys(value).length > 0) {
                const editorState = editor.parseEditorState(
                    JSON.stringify(value)
                );
                editor.setEditorState(editorState);
            } else {
                const root = $getRoot();
                root.append($createParagraphNode());
            }
        });
    }, [editor, value]);

    return null;
}

interface Props {
    value: any;
}

export default function LexicalViewer({ value }: Props) {
    const config = {
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

    return (
        <LexicalComposer initialConfig={config}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable  className="outline-none pointer-events-none" />
                }
                placeholder={null}
                ErrorBoundary={() => null}
            />

            <LoadState value={value} />
        </LexicalComposer>
    );
}
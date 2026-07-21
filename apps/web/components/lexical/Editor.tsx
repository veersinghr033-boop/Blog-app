"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import SetEditorContent from "./plugins/SetEditorContent";
import dynamic from "next/dynamic";

const Toolbar = dynamic(
    () => import("./Toolbar"),
    {
        ssr: false,
    }
); import theme from "./theme";
import EditorChangePlugin from "./plugins/OnChangePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

const initialConfig = {
    namespace: "BlogEditor",
    theme,
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeHighlightNode,
        LinkNode,
    ],
    onError(error: Error) {
        console.error(error);
    }
};
interface Props {
    initialContent: string;
    onChange: (value: any) => void;
}

export default function Editor({
    initialContent,
    onChange,
}: Props) {
   

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="border border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                <Toolbar />

                <div className="p-4 max-h-86 overflow-y-auto bg-white dark:bg-zinc-900">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="outline-none min-h-60 text-black dark:text-white" />
                        }
                        placeholder={
                            <div className="text-gray-400 dark:text-gray-500">
                                Write your blog...
                            </div>
                        }
                        ErrorBoundary={() => null}
                    />

                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <SetEditorContent value={initialContent} />
                    <EditorChangePlugin onChange={onChange} />
                </div>
            </div>
        </LexicalComposer>
    );
}
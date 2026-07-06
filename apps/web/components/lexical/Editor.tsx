"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import SetEditorContent from "./plugins/SetEditorContent";
import Toolbar from "./Toolbar";
import theme from "./theme";
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
        throw error;
    },
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
            <div className="border rounded-lg overflow-hidden bg-white border-gray-300">
                <Toolbar />

                <div className="p-4 max-h-86 overflow-y-auto">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="outline-none min-h-60 " />
                        }
                        placeholder={
                            <div className="text-gray-400">
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
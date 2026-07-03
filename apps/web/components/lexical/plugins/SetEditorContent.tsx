import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getRoot,
    $createParagraphNode,
    $isElementNode,
} from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";

export default function SetEditorContent({
    value,
}: {
    value: string;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!value) return;

        editor.update(() => {
            const parser = new DOMParser();

            const dom = parser.parseFromString(
                value,
                "text/html"
            );

            const nodes = $generateNodesFromDOM(
                editor,
                dom
            );

            const root = $getRoot();

            root.clear();

            nodes.forEach((node) => {
                if ($isElementNode(node)) {
                    root.append(node);
                } else {
                    const paragraph =
                        $createParagraphNode();

                    paragraph.append(node);
                    root.append(paragraph);
                }
            });
        });
    }, [value, editor]);

    return null;
}
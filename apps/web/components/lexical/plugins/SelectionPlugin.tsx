"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

interface Props {
    onSelectionChange: (hasSelection: boolean) => void;
}

export default function SelectionPlugin({ onSelectionChange }: Props) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unsubscribe = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                const hasSelection = $isRangeSelection(selection) && !selection.isCollapsed();
                onSelectionChange(hasSelection);
            });
        });

        return unsubscribe;
    }, [editor, onSelectionChange]);

    return null;
}

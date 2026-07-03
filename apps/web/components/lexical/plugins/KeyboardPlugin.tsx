"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";

interface Props {
    onEnter: () => void;
}

export default function KeyboardPlugin({ onEnter }: Props) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unsubscribe = editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event: KeyboardEvent) => {
                if (event.shiftKey) {
                    return false; 
                }

                event.preventDefault();
                onEnter();
                return true;
            },
            COMMAND_PRIORITY_HIGH
        );

        return unsubscribe;
    }, [editor, onEnter]);

    return null;
}

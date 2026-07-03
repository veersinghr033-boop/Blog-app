"use client";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState } from "lexical";


interface Props {
    onChange: (value: any) => void;
}

export default function EditorChangePlugin({
    onChange,
}: Props) {
   const handleChange = (editorState: EditorState)=>{
    onChange(editorState.toJSON());
   }

    return <OnChangePlugin  onChange={handleChange}/>
}
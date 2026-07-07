import React from "react";

export default function LexicalContentRenderer({
    content,
}: {
    content: any;
}) {
    if (!content?.root?.children) return null;

    const renderText = (child: any) => {
        let content: React.ReactNode = child.text;

        if (child.format & 1) {
            content = <strong>{content}</strong>;
        }

        if (child.format & 2) {
            content = <em>{content}</em>;
        }

        if (child.format & 8) {
            content = <u>{content}</u>;
        }

        return content;
    };

    const renderNode = (node: any, key: string) => {
        switch (node.type) {
            case "heading": {
                const text = node.children
                    ?.map((c: any) => c.text)
                    .join("");

                if (node.tag === "h1")
                    return (
                        <h1 key={key} className="text-4xl font-bold mb-4">
                            {node.children?.map((child: any, index: number) => (
                                <React.Fragment key={index}>
                                    {renderText(child)}
                                </React.Fragment>
                            ))}
                        </h1>
                    );

                if (node.tag === "h2")
                    return (
                        <h2 key={key} className="text-3xl font-semibold mb-3">
                            {node.children?.map((child: any, index: number) => (
                                <React.Fragment key={index}>
                                    {renderText(child)}
                                </React.Fragment>
                            ))}
                        </h2>
                    );

                if (node.tag === "h3")
                    return (
                        <h3 key={key} className="text-2xl font-medium mb-2">
                            {node.children?.map((child: any, index: number) => (
                                <React.Fragment key={index}>
                                    {renderText(child)}
                                </React.Fragment>
                            ))}
                        </h3>
                    );

                return null;
            }

            case "paragraph":
                return (
                    <p key={key} className="mb-3">
                        {node.children?.map(
                            (child: any, index: number) => {
                                let content = child.text;

                                if (child.format & 1) {
                                    content = <strong>{content}</strong>;
                                }

                                if (child.format & 2) {
                                    content = <em>{content}</em>;
                                }

                                if (child.format & 8) {
                                    content = <u>{content}</u>;
                                }


                                return (
                                    <React.Fragment key={index}>
                                        {content}
                                    </React.Fragment>
                                );
                            }
                        )}
                    </p>
                );

            case "list":
                if (node.listType === "bullet") {
                    return (
                        <ul
                            key={key}
                            className="list-disc pl-6 mb-3"
                        >
                            {node.children?.map(
                                (item: any, idx: number) => (
                                    <li key={idx}>
                                        {item.children?.map(
                                            (c: any) => c.text
                                        )}
                                    </li>
                                )
                            )}
                        </ul>
                    );
                }

                return (
                    <ol
                        key={key}
                        className="list-decimal pl-6 mb-3"
                    >
                        {node.children?.map(
                            (item: any, idx: number) => (
                                <li key={idx}>
                                    {item.children?.map(
                                        (c: any) => c.text
                                    )}
                                </li>
                            )
                        )}
                    </ol>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {content.root.children.map(
                (node: any, index: number) =>
                    renderNode(node, String(index))
            )}
        </>
    );
}
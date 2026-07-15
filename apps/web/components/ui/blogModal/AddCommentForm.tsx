
// "use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { toast } from "sonner";


export default function AddCommentForm({ blogId }: { blogId: string }) {

    const queryClient = useQueryClient();
    const commentMutation = useMutation({
        mutationFn: async (values: any) => {
            await api.post(`/comments/${blogId}`, {
                comment: values.comment,
            });
        },

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["comments", blogId],
            });
            // Invalidate the specific blog query to update comment counts
            queryClient.invalidateQueries({
                queryKey: ["blog", blogId],
            });

            toast.success("Comment added");
        },
    });

    const handleCommentSubmit = (e: any) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        const comment = String(data.get("comment") || "").trim();
        if (!comment) {
            toast.warning("Please enter a comment");
            return;
        }

        commentMutation.mutate({ comment });
        form.reset();
    };

    return (
        <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start">
            <input name="comment" placeholder="Write your comment..." className="flex-1 border p-2 rounded" />
            <button type="submit" disabled={commentMutation.isPending} className="bg-black text-white px-3 py-2 rounded">Add Comment</button>
        </form>
    )
}

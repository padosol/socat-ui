import { useState, useEffect } from "react"
import { Button } from "@/components/button"
import { 
  type CommentState,
  createComment
} from "@/lib/api/post/comment/create-comment"
import { getComments, type Comment } from "@/lib/api/post/comment/get-comments"
import { useActionState } from "react"

type UIComment = {
  id: string;
  username: string;
  content: string;
  createdAt: string;
  replies?: UIComment[];
}

const mapApiCommentToUIComment = (comment: Comment): UIComment => {
  return {
    id: comment.commentId,
    username: comment.username,
    content: comment.comment,
    createdAt: comment.createdAt.toString(),
    replies: comment.replies?.map(mapApiCommentToUIComment)
  }
}

export default function CommentSection({
  postId      
} : {
  postId: string
}) {
  const [comments, setComments] = useState<UIComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const initialState: CommentState = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(createComment, initialState);

  const fetchComments = async () => {

    const response = await getComments(postId);
    console.log(response)

    const uiComments = response.map(mapApiCommentToUIComment);
    setComments(uiComments);
  }

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (state.success) {
      setNewComment("");
      fetchComments();
    }
  }, [state]);

  const handleReply = (parentId: string) => {
    if (replyContent.trim() === "") return

    const updatedComments = comments.map((comment) => {
      if (comment.id === parentId) {
        const newReply: UIComment = {
          id: String(comment.replies ? comment.replies.length + 1 : 1),
          username: "CurrentUser", // Replace with actual username from auth context
          content: replyContent,
          createdAt: new Date().toISOString(),
        }
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        }
      }
      return comment
    })

    setComments(updatedComments)
    setReplyingToCommentId(null)
    setReplyContent("")
  }

  const handleEdit = (commentId: string, newContent: string) => {
    if (newContent.trim() === "") return

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, content: newContent }
      }
      return comment
    })

    setComments(updatedComments)
    setEditingCommentId(null)
  }

  const handleDelete = (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    const updatedComments = comments.filter((comment) => comment.id !== commentId)
    setComments(updatedComments)
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h2 className="text-lg font-bold mb-2">Comments</h2>
      <div className="my-4">
        <form action={formAction}>
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="parentId" value="" />
          <textarea
            name="comment"
            className="w-full border p-2 rounded-md h-20"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" className="bg-blue-500 text-white">
              댓글추가
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border p-2 rounded-md">
            <div className="text-sm text-gray-500 mb-1">
              <span>{comment.username}</span>
              <span className="mx-2">|</span>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  className="w-full border p-2 rounded-md h-20"
                  defaultValue={comment.content}
                  onChange={(e) => handleEdit(comment.id, e.target.value)}
                />
                <div className="flex space-x-2 mt-2">
                  <Button
                    className="bg-green-500 text-white"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Save
                  </Button>
                  <Button
                    className="bg-gray-500 text-white"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p>{comment.content}</p>
            )}
            <div className="flex space-x-2 mt-2">
              <Button
                className="bg-blue-500 text-white"
                onClick={() => setReplyingToCommentId(comment.id)}
              >
                Reply
              </Button>
              <Button
                className="bg-yellow-500 text-white"
                onClick={() => setEditingCommentId(comment.id)}
              >
                Edit
              </Button>
              <Button
                className="bg-red-500 text-white"
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </Button>
            </div>
            {replyingToCommentId === comment.id && (
              <div className="mt-2">
                <textarea
                  className="w-full border p-2 rounded-md h-20"
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div className="flex space-x-2 mt-2">
                  <Button
                    className="bg-green-500 text-white"
                    onClick={() => handleReply(comment.id)}
                  >
                    Submit Reply
                  </Button>
                  <Button
                    className="bg-gray-500 text-white"
                    onClick={() => setReplyingToCommentId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="border p-2 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">
                      <span>{reply.username}</span>
                      <span className="mx-2">|</span>
                      <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
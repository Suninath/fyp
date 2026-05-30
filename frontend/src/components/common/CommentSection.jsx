import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment, getCommentsByVehicleId, replyToComment } from "../../rtk/thunk/commentThunk";
import { Button } from "../../ui/ui/button";
import { Textarea } from "../../ui/ui/textarea";
import { Send, MessageSquare, Reply, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Pagination from "./Pagination";

const CommentItem = ({ comment, vehicleId, onReply, user }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const dispatch = useDispatch();

    const handleSubmitReply = async () => {
        if(!replyText.trim()) return;
        await dispatch(replyToComment({ commentId: comment.id, reply: replyText }));
        setIsReplying(false);
        setReplyText("");
    };

    return (
        <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                    {comment.user?.name ? comment.user.name[0].toUpperCase() : <User className="w-5 h-5" />}
                </div>
            </div>
            
            <div className="flex-1">
                {/* Bubble Container */}
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-[90%]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">
                            {comment.user?.name || "User"}
                        </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-4 mt-1 ml-2">
                     <span className="text-xs text-gray-500 font-medium">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                    <button 
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs font-bold text-gray-500 hover:underline cursor-pointer"
                    >
                        Reply
                    </button>
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-3 flex gap-2 animate-in fade-in zoom-in-95">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                            {user?.name ? user.name[0].toUpperCase() : "U"}
                         </div>
                         <div className="flex-1">
                            <Textarea 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.user?.name}...`}
                                className="min-h-[40px] text-sm py-2 px-3 rounded-2xl bg-gray-50 border-gray-300 focus:ring-blue-500/20"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setIsReplying(false)}
                                    className="h-7 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    size="sm" 
                                    onClick={handleSubmitReply}
                                    className="h-7 text-xs bg-blue text-white hover:bg-blue-600"
                                    disabled={!replyText.trim()}
                                >
                                    Reply
                                </Button>
                            </div>
                         </div>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map(reply => (
                             <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                vehicleId={vehicleId} 
                                onReply={onReply}
                                user={user}
                             />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({ vehicleId, isOwner }) => {
  const dispatch = useDispatch();
  const { comments, loading, pagination } = useSelector((state) => state.comment);
  const { user } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (vehicleId) {
      dispatch(getCommentsByVehicleId({ vehicleId, page, limit: pageSize }));
    }
  }, [dispatch, vehicleId, page, pageSize]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await dispatch(addComment({ vehicleId, content: newComment }));
    setNewComment("");
    // Refresh comments after adding
    dispatch(getCommentsByVehicleId({ vehicleId, page: 1, limit: pageSize }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue" />
        Comments 
        <span className="text-sm font-normal text-gray-500 ml-1">({comments.length})</span>
      </h3>

      {/* Main Comment Input */}
      <div className="flex gap-3 mb-8">
         <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold border border-gray-300">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-5 h-5" />}
         </div>
         <div className="flex-1 relative">
            <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a public comment..."
                className="min-h-[60px] bg-gray-50 border-transparent focus:border-blue-300 focus:bg-white transition-all rounded-2xl resize-none py-3 px-4"
            />
            {newComment.trim() && (
                <div className="absolute bottom-2 right-2">
                     <Button 
                        size="sm"
                        onClick={handleAddComment} 
                        disabled={loading}
                        className="h-8 w-8 p-0 rounded-full bg-blue hover:bg-blue/90 text-white shadow-md"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            )}
         </div>
      </div>

      {/* Comments Feed */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
             No comments yet.
          </div>
        ) : (
          comments.map((comment) => (
             <CommentItem 
                key={comment.id}
                comment={comment}
                vehicleId={vehicleId}
                user={user}
             />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination?.currentPage || page}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.count || 0}
            pageSize={pagination?.perpage || pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
};

export default CommentSection;

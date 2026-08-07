import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function CommentThread({ taskId, workspaceMembers, highlightCommentId = null }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const commentRefs = useRef({});

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/tasks/${taskId}/comments`);
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };

    fetchComments();
  }, [taskId]);

  useEffect(() => {
    if (highlightCommentId && commentRefs.current[highlightCommentId]) {
      commentRefs.current[highlightCommentId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightCommentId, comments]);

  useEffect(() => {
    if (!socket) return;

    const handleAdded = (comment) => {
      if (comment.task === taskId || comment.task?._id === taskId) {
        setComments((prev) => {
          const exists = prev.some((c) => c._id === comment._id);

          if (exists) return prev;

          return [...prev, comment];
        });
      }
    };

    const handleDeleted = ({ commentId, taskId: eventTaskId }) => {
      if (eventTaskId === taskId) {
        setComments((prev) =>
          prev.filter((c) => c._id !== commentId)
        );
      }
    };

    socket.on('comment:added', handleAdded);
    socket.on('comment:deleted', handleDeleted);

    return () => {
      socket.off('comment:added', handleAdded);
      socket.off('comment:deleted', handleDeleted);
    };
  }, [socket, taskId]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionQuery(afterAt.toLowerCase());
        setShowMentionList(true);
        setHighlightedIndex(0);
        return;
      }
    }
    setShowMentionList(false);
  };

  const handleKeyDown = (e) => {
    if (!showMentionList || filteredMembers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredMembers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectMention(filteredMembers[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowMentionList(false);
    }
  };

  const handleSelectMention = (member) => {
    const lastAtIndex = text.lastIndexOf('@');
    const newText = text.slice(0, lastAtIndex) + `@${member.user.username} `;
    setText(newText);
    setMentions((prev) => (prev.includes(member.user._id) ? prev : [...prev, member.user._id]));
    setShowMentionList(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const { data } = await api.post(
        `/tasks/${taskId}/comments`,
        {
          text,
          mentions,
        }
      );

      setComments((prev) => [...prev, data]);

      setText('');
      setMentions([]);
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleDelete = async (commentId) => {
    const previous = comments;

    setComments((prev) =>
      prev.filter((c) => c._id !== commentId)
    );

    try {
      await api.delete(
        `/tasks/${taskId}/comments/${commentId}`
      );
    } catch (err) {
      console.error('Failed to delete comment', err);
      setComments(previous);
    }
  };

  const filteredMembers = workspaceMembers.filter((m) =>
    m.user.username.toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="mt-6 border-t border-zinc-800/80 pt-5 space-y-4 antialiased">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Comments
        </h3>
        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* Comment List */}
      <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <li
            key={comment._id}
            ref={(el) => (commentRefs.current[comment._id] = el)}
            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 group ${
              comment._id === highlightCommentId
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/60'
            }`}
          >
            <Avatar username={comment.author?.username} avatarUrl={comment.author?.avatar} size="sm" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {comment.author?.username || 'Unknown'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(comment.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words">
                {comment.text}
              </p>
            </div>

            {comment.author?._id === user?._id && (
              <button
                onClick={() => handleDelete(comment._id)}
                className="text-[11px] text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium px-1 cursor-pointer"
              >
                Delete
              </button>
            )}
          </li>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4 italic">
            No comments yet. Start the conversation!
          </p>
        )}
      </ul>

      {/* Form & Mention Dropdown */}
      <form onSubmit={handleSubmit} className="relative pt-2">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... use @ to mention someone"
            rows={2}
            className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 text-xs rounded-xl p-3 resize-none outline-none transition-all duration-200"
          />

          {/* Mentions Dropdown */}
          {showMentionList && filteredMembers.length > 0 && (
            <ul className="absolute bottom-full mb-2 left-0 w-full bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl max-h-44 overflow-y-auto z-20 divide-y divide-zinc-800/60">
              {filteredMembers.map((member, index) => (
                <li
                  key={member.user._id}
                  onClick={() => handleSelectMention(member)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <Avatar username={member.user.username} avatarUrl={member.user.avatar} size="xs" />
                  <span className="font-medium">{member.user.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs rounded-xl px-4 py-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
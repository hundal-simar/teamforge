import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function CommentThread({ taskId, workspaceMembers }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef(null);

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
        return;
      }
    }

    setShowMentionList(false);
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
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Comments
      </h3>

      <ul className="space-y-3 mb-3 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <li
            key={comment._id}
            className="flex items-start gap-2 group"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
              {comment.author?.username
                ?.charAt(0)
                .toUpperCase()}
            </span>

            <div className="flex-1">
              <p className="text-xs text-gray-500">
                <strong>{comment.author?.username}</strong>{' '}
                <span className="text-gray-400">
                  {new Date(
                    comment.createdAt
                  ).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>

              <p className="text-sm text-gray-800">
                {comment.text}
              </p>
            </div>

            {comment.author?._id === user?._id && (
              <button
                onClick={() =>
                  handleDelete(comment._id)
                }
                className="text-gray-300 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            )}
          </li>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-gray-400">
            No comments yet.
          </p>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Write a comment... use @ to mention someone"
          rows={2}
          className="w-full text-sm border border-gray-300 rounded p-2 resize-none"
        />

 {showMentionList && filteredMembers.length > 0 && (
  <ul className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded shadow-md max-h-32 overflow-y-auto z-10">
    {filteredMembers.map((member) => (
      <li
        key={member.user._id}
        onClick={() => handleSelectMention(member)}
        className="px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
      >
        {member.user.username}
      </li>
    ))}
  </ul>
)}

        <button
          type="submit"
          className="mt-1.5 text-xs bg-indigo-600 text-white rounded px-2.5 py-1.5"
        >
          Post
        </button>
      </form>
    </div>
  );
}
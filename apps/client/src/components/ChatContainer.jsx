import React, { useEffect, useRef, useState } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import ChatHeader from "./ChatHeader.jsx"
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import avatar from '../assets/avatar.png'
import { formatMessageTime } from "../lib/util.js"
import { Copy, Trash, Edit2, Smile, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import DeleteInterface from "./DeleteInterface.jsx"

function ChatContainer() {
  const { getMessages, messages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribesFromMessages, deleteCheck, toggleDeleteCheck, addReaction, editMessage } = useMessageStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.text);
    toast.success("Message copied to clipboard")
  }

  const handleDelete = (message) => {
    setMessageToDelete(message);
    toggleDeleteCheck();
  }

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  }

  const startEditing = (message) => {
    setEditingMessageId(message._id);
    setEditText(message.text);
  }

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  }

  const submitEdit = async (messageId) => {
    if (!editText.trim()) return;
    await editMessage(messageId, editText);
    setEditingMessageId(null);
  }

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, deleteCheck]);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribesFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribesFromMessages]);

  if (!selectedUser) return null;

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col'>
        <ChatHeader />
        <div className='flex-1 overflow-y-auto'><MessageSkeleton /></div>
        <MessageInput />
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col bg-base-100/50'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300'>
        <div className='p-4 space-y-6'>
          {deleteCheck ? <DeleteInterface message={messageToDelete} /> :
            messages.map((message) => {
              const isMine = message.senderId === authUser._id;
              const isDeleted = isMine ? message.deleteForSender : message.deleteForReciever;
              if (isDeleted) return null;

              return (
                <div key={message._id} className={`chat group ${isMine ? 'chat-end' : 'chat-start'} animate-in fade-in duration-300`}>
                  <div className='chat-image avatar'>
                    <div className='size-9 rounded-full border shadow-sm overflow-hidden'>
                      <img src={isMine ? authUser.profilePic || avatar : selectedUser.profilePic || avatar} alt='profile' />
                    </div>
                  </div>
                  
                  <div className='chat-header mb-1 flex items-center gap-2'>
                    <span className="text-xs font-medium opacity-70">
                      {isMine ? 'You' : selectedUser.fullName}
                    </span>
                    <time className='text-[10px] opacity-40'>
                      {formatMessageTime(message.createdAt)}
                    </time>
                    {message.isEdited && <span className="text-[10px] italic opacity-40">(edited)</span>}
                  </div>

                  <div className={`chat-bubble relative flex flex-col gap-1 min-w-[60px] max-w-[85%] 
                    ${isMine ? 'bg-primary text-primary-content shadow-md' : 'bg-base-200 shadow-sm'}`}>
                    
                    {message.image && (
                      <img src={message.image} alt='attachment' className='rounded-lg max-h-60 object-cover mb-1' />
                    )}

                    {editingMessageId === message._id ? (
                      <div className="flex flex-col gap-2 p-1">
                        <textarea 
                          className="textarea textarea-bordered textarea-xs w-full text-base-content bg-base-100"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={cancelEditing} className="btn btn-xs btn-ghost text-[10px]">Cancel</button>
                          <button onClick={() => submitEdit(message._id)} className="btn btn-xs btn-neutral text-[10px]">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm leading-relaxed whitespace-pre-wrap break-words px-1'>
                        {message.text}
                      </p>
                    )}

                    {/* AI Tone Indicator */}
                    {message.toneAnalysis && message.text && (
                      <div className={`flex items-center gap-1 mt-1 px-1 py-0.5 rounded text-[10px] w-fit 
                        ${isMine ? 'bg-primary-focus/30 text-primary-content/80' : 'bg-base-300 text-base-content/60'}`}>
                        <Sparkles className="size-3" />
                        <span className="capitalize">{message.toneAnalysis.overallTone}</span>
                      </div>
                    )}

                    {/* Reactions Display */}
                    {message.reactions?.length > 0 && (
                      <div className={`absolute -bottom-3 ${isMine ? 'right-0' : 'left-0'} flex flex-wrap gap-1 z-10`}>
                        {message.reactions.reduce((acc, curr) => {
                          const existing = acc.find(r => r.emoji === curr.emoji);
                          if (existing) existing.count++;
                          else acc.push({ emoji: curr.emoji, count: 1 });
                          return acc;
                        }, []).map((reaction, i) => (
                          <div key={i} className="badge badge-sm badge-outline bg-base-100 gap-1 px-1.5 py-2 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleReaction(message._id, reaction.emoji)}>
                            <span>{reaction.emoji}</span>
                            <span className="text-[10px]">{reaction.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  {!editingMessageId && (
                    <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 
                      ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex bg-base-200/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-base-300">
                        <button onClick={() => handleReaction(message._id, "👍")} className='hover:bg-base-300 p-1 rounded-full text-xs'>👍</button>
                        <button onClick={() => handleReaction(message._id, "❤️")} className='hover:bg-base-300 p-1 rounded-full text-xs'>❤️</button>
                        <button onClick={() => handleReaction(message._id, "😂")} className='hover:bg-base-300 p-1 rounded-full text-xs'>😂</button>
                        <div className="divider divider-horizontal mx-0 w-1 opacity-50"></div>
                        <button onClick={() => handleCopy(message)} className='hover:bg-base-300 p-1.5 rounded-full tooltip' data-tip="Copy">
                          <Copy className='size-3.5' />
                        </button>
                        {isMine && (
                          <button onClick={() => startEditing(message)} className='hover:bg-base-300 p-1.5 rounded-full tooltip' data-tip="Edit">
                            <Edit2 className='size-3.5' />
                          </button>
                        )}
                        <button onClick={() => handleDelete(message)} className='hover:bg-base-300 p-1.5 rounded-full text-error tooltip' data-tip="Delete">
                          <Trash className='size-3.5' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          }
          <div ref={messageEndRef} />
        </div>
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer
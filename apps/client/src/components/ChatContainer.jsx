import React, { useEffect, useRef, useState } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import ChatHeader from "./ChatHeader.jsx"
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import avatar from '../assets/avatar.png'
import { formatMessageTime } from "../lib/util.js"
import { Copy, Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import DeleteInterface from "./DeleteInterface.jsx"

function ChatContainer() {
  const { getMessages, messages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribesFromMessages, deleteCheck, toggleDeleteCheck } = useMessageStore();
  const { authUser,socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.text);
    toast.success("Message copied to clipboard")
  }

  const handleDelete = (message) => {
    setMessageToDelete(message);
    toggleDeleteCheck();
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, deleteCheck]);


  // Handle messages and socket subscription
  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      await getMessages(selectedUser._id);
    };

    fetchMessages();
    subscribeToMessages();

    // Add listener for deleted messages
    if (socket?.connected) {
      socket.on("messageDeleted", ({ messageId }) => {
        // Fetch messages again to get updated list
        fetchMessages();
      });
    }





    return () => {
      unsubscribesFromMessages();
      if (socket?.connected) {
        socket.off("messageDeleted");
      }
    }
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribesFromMessages])

  if (!selectedUser) return null;

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col'>
        <ChatHeader />
        <div className='flex-1 overflow-y-auto'>
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto'>
        <div className='p-4 space-y-4'>
          {deleteCheck ? <DeleteInterface message={messageToDelete} /> :
            messages.map((message) => (
              ((message.senderId === authUser._id ? !message.deleteForSender : !message.deleteForReciever) ? <div key={message._id}
                className={`chat group ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
              >
                <div className='chat-image avatar'>
                  <div className='size-10 rounded-full border'>
                    <img
                      src={message.senderId === authUser._id ? authUser.profilePic || avatar : selectedUser.profilePic || avatar}
                      alt='Profile-Pic'
                    />
                  </div>
                </div>
                <div  className='chat-header mb-1'>
                  <time className='text-xs opacity-50 ml-1'>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className='chat-bubble flex flex-col'>
                  {message.image && (
                    <img
                      src={message.image}
                      alt='Attachment'
                      className='sm:max-w-[200px] rounded-md mb-2'
                    />
                  )}
                  {message.text && <p className='p-1'>{message.text}</p>}
                </div>
                <div className={`flex flex-row items-center gap-1 mt-1 ${message.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}>
                  <button className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-base-200 p-1 rounded-full'
                    onClick={() => handleCopy(message)}>
                    <Copy className='size-4' />
                  </button>
                  <button className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-base-200 p-1 rounded-full'
                    onClick={() => handleDelete(message)}>
                    <Trash className='size-4' />
                  </button>
                </div>
              </div> : null)
            ))
          }
          <div ref={messageEndRef} />
        </div>
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer
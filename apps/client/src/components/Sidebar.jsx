import React, { use, useEffect, useState } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import SidebarSkeleton from '../components/skeletons/SidebarSkeleton.jsx'
import { Users } from 'lucide-react';
import avatar from '../assets/avatar.png'
import { useAuthStore } from '../store/useAuthStore';

function Sidebar() {
  const { users, selectedUser, isLoadingUsers, getUsers, setSelectedUser,typingUsers, setTypingUsers } = useMessageStore();
  const { onlineUsers } = useAuthStore();

  const [onlyOnlineUser, setOnlyOnlineUser] = useState(false);

  useEffect(() => {
    const cleanup = setTypingUsers();
    return () => cleanup && cleanup();
  }, [setTypingUsers]);

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const filteredUsers = onlyOnlineUser ? users.filter((user) => {
    return onlineUsers.includes(user._id)
  }) : users

  if (isLoadingUsers) return <SidebarSkeleton />

  return (
    <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100/50'>
      <div className='border-b border-base-300 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='size-6 text-primary' />
          <span className='font-bold text-lg hidden lg:block tracking-tight'>Messages</span>
        </div>
        <div className='mt-4 hidden lg:flex flex-col gap-3'>
          <label className='flex items-center gap-3 cursor-pointer group'>
            <input
              type='checkbox'
              checked={onlyOnlineUser}
              onChange={(e) => setOnlyOnlineUser(e.target.checked)}
              className='checkbox checkbox-primary checkbox-sm rounded'
            />
            <span className='text-sm font-medium group-hover:text-primary transition-colors'>Online Only</span>
          </label>
          <div className='flex items-center gap-2 px-1'>
            <div className='size-2 rounded-full bg-green-500 animate-pulse'></div>
            <span className='text-[11px] font-medium text-base-content/60 uppercase tracking-wider'>
              {onlineUsers.length} Online
            </span>
          </div>
        </div>
      </div>

      <div className='overflow-y-auto w-full py-2 flex-1 scrollbar-hide'>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-base-200/50 transition-all relative border-l-4 
              ${selectedUser?._id === user._id 
                ? "bg-primary/10 border-primary" 
                : "border-transparent"}`}
          >
            <div className='relative flex-shrink-0'>
              <img
                src={user.profilePic || avatar}
                alt={user.fullName}
                className={`size-12 object-cover rounded-full border-2 
                  ${selectedUser?._id === user._id ? 'border-primary' : 'border-base-300'}`}
              />
              {onlineUsers.includes(user._id) && (
                <span className='absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-base-100 shadow-sm' />
              )}
            </div>

            <div className='hidden lg:block text-left min-w-0 flex-1'>
              <div className='font-semibold truncate text-[15px]'>
                {user.fullName}
              </div>
              <div className={`text-xs truncate ${typingUsers.includes(user._id) ? "text-primary font-medium italic" : "text-base-content/50"}`}>
                {typingUsers.includes(user._id) ? "Typing..." : onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className='flex flex-col items-center justify-center p-8 text-center gap-2 opacity-40'>
            <Users className="size-10" />
            <p className='text-sm font-medium'>No contacts found</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
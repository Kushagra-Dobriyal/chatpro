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

  useEffect(()=>{
    setTypingUsers
  })

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const filterdUsers = onlyOnlineUser ? users.filter((user) => {
    return onlineUsers.includes(user._id)
  }) : users


  if (isLoadingUsers) return <SidebarSkeleton />

  return (
    <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200'>
      <div className='border-b border-base-300 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='size-6' />
          <span className='font-medium hidden lg:block'>Contacts</span>
        </div>
        <div className='mt-3 hdden lg:flex items-center gap-2' >
          <label className='cursor-pointer flex items-center gap-2'>
            <input
              type='checkbox'
              checked={onlyOnlineUser}
              onChange={(e) => setOnlyOnlineUser(e.target.checked)}
              className='checkbox checkbox-sm'
            />
            <span className='text-sm'>Show online only</span>
          </label>
          <span className='text-xs text-zinc-500'>(Online Users: {onlineUsers.length})</span>
        </div>
      </div>

      <div className='overflow-y-auto w-full py-3'>
        {filterdUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
          >
            <div className='relative mx-auto lg:mx-0'>
              <img
                src={user.profilePic || avatar}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900'
                />
              )}
            </div>

            <div className='hidden lg:block text-left min-w-0'>
              <div className='font-medium truncate'>{user.fullName}</div>
              <div className='text-sm text-zinc-400'>
                {typingUsers.includes(user._id)?"Typing": onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filterdUsers.length===0 && (
          <div className='text-center bg-zinc-500 p-y'>
            No online Users
          </div>

        )}


      </div>
    </aside>
  )
}

export default Sidebar
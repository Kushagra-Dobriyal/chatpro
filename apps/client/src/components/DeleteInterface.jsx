import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useMessageStore } from '../store/useMessageStore'
import { useAuthStore } from '../store/useAuthStore';


function DeleteInterface({ message }) {
    const { toggleDeleteCheck, deleteMessageFromAll, deleteMessageFromMe } = useMessageStore();
    const { authUser } = useAuthStore();
    // const [deletable, SetDeletable] = useState(false);

    const timeDiff = Math.abs(new Date() - new Date(message.createdAt));
    const fiveMinutes = 5 * 60 * 1000;

   

    const handleDeleteFromAll = () => {
        deleteMessageFromAll(message);

    }

    const handleDeleteFromMe = () => {
        deleteMessageFromMe(message);
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col gap-4'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-semibold'>Delete Message</h2>
                    <button
                        onClick={toggleDeleteCheck}
                        className='p-1 rounded-full hover:bg-base-300 transition-colors'
                    >
                        <X className='size-5' />
                    </button>
                </div>

                <p className='text-base-content/80'>
                    Are you sure you want to delete this message?
                </p>

                <div className='bg-base-200 p-3 rounded-md italic text-sm text-base-content/70 break-words'>
                    "{message?.text || (message?.image ? '[Image Message]' : 'No message content')}"
                </div>

                <div className='flex justify-end gap-3 mt-4'>
                    <button
                        className='btn btn-ghost'
                        onClick={handleDeleteFromMe}
                    >
                        Delete for Me
                    </button>

                    <button
                        className='btn btn-error'
                        onClick={handleDeleteFromAll}
                        disabled={!(timeDiff <= fiveMinutes) || !(message.senderId === authUser._id)}
                    >
                        Delete for Everyone
                    </button>


                </div>
            </div>
        </div>
    )
}

export default DeleteInterface
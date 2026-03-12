import React, { useState, useEffect } from 'react'
import { useMessageStore } from '../store/useMessageStore';
import { X, Image, Send } from 'lucide-react'
import toast from 'react-hot-toast'


function MessageInput() {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const { sentMessages, setTypingStatus, typingTimeout, selectedUser, isSendingImage, setTyping} = useMessageStore();

    useEffect(() => {
        // Clear image preview when selected user changes
        setImagePreview(null);
        setText("");
    }, [selectedUser]);


    const userTypingMessage = () => {
       setTyping(true);
    }
    

    const removeImage = () => {
        setImagePreview(null);
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!text.trim() && !imagePreview) return;
        try {
            console.log("Sending message with:", {
                text: text.trim(),
                hasImage: !!imagePreview,
                imagePreviewLength: imagePreview?.length
            });

            const response = await sentMessages({
                text: text.trim(),
                image: imagePreview
            });

            console.log("Message sent successfully:", response);
            setImagePreview(null);
            setText("");

        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    }

    const handleImagechange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image only");
            return;
        }

        console.log("Selected file:", {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const reader = new FileReader()
        reader.onloadend = () => {
            console.log("File read complete, preview length:", reader.result.length);
            setImagePreview(reader.result);
        }
        reader.readAsDataURL(file)
    }

    const Sending = () => {
        return (
            <div className='flex text-center gap-2'>
                <p className='text-xl'>Sending</p>
                <span className="loading loading-dots loading-md mt-2"></span>
            </div>
        );
    }



    return (
        <div className='p-4 w-full'>
            {isSendingImage ? <Sending /> : imagePreview && (
                <div className='mb-3 flex items-center gap-2'>
                    <div className='relative'>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className='w-20 h-20 object-cover rounded-lg border border-zinc-700'
                        />
                        <button
                            onClick={removeImage}
                            className='absolute top-0 right-0 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center'
                            type='button'
                        >
                            <X className='size-3' />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage}
                className='flex items-center gap-2'
            >
                <div className='flex-1 flex gap-2 items-center justify-center'>
                    <input type="text"
                        placeholder="Type here"
                        className="input input-bordered w-full"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            userTypingMessage();
                        }}
                    />
                    <label
                        htmlFor="image-upload"
                        className={`  hover:scale-105 p-3 rounded-full cursor-pointer transition-all duration-200 `}
                    >
                        <Image className='size-5 ' />
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImagechange}
                    />
                    {/* When we will click the button behind the scene we will be clicking the input */}

                    <button
                        type='submit'
                        className='btn btn-sm border-5'
                        disabled={isSendingImage || (!text.trim() && !imagePreview)}
                    >
                        <Send className='size-5' />
                    </button>
                </div>
            </form>
        </div>

    )
}

export default MessageInput


import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Camera, Mail, User } from 'lucide-react';
import avatarImage from '../assets/avatar.png'
import toast from 'react-hot-toast';

function ProfilePage() {
  const { isUpdatingProfile, authUser, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = React.useState(null);

  /* Image Compression Function
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Create canvas for image manipulation
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;  // Maximum width for the image
          const MAX_HEIGHT = 800; // Maximum height for the image
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Draw image on canvas with new dimensions
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality (0.7 = 70% quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
      };
    });
  };
  */


  const handleProfileUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        // Ensure the base64 string is properly formatted
        if (!base64Image.startsWith('data:image/')) {
          toast.error("Invalid image format");
          return;
        }

        const response = await updateProfile({ profilePic: base64Image });

        if (response === true) {
          setSelectedImage(base64Image);
          toast.success("Your Profile pic is updated successfully!!");
        } else {
          toast.error("Oops! Looks like something went wrong");
        }
      };
    } catch (error) {
      toast.error("Error updating profile picture");
      console.error(error);
    }
  }

  return (
    <div className='h-screen'>
      <div className='max-w-2xl mx-auto p-4 py-8 mt-[50px]'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>
          <div className='text-center animate-slide-in-left'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='mt-2'>Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className='flex flex-col items-center gap-4 mt-4 animate-slide-in-left'>
            <div className='relative'>
              <img
                src={selectedImage || authUser.profilePic || avatarImage}
                alt="Profile"
                className='size-32 rounded-full object-cover border-4'
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className='size-5 text-base-200' />
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleProfileUpdate}
              />
            </div>
            <p className='text-sm text-zinc-400'>
              {isUpdatingProfile ? "Uploading...." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className='space-y-6 animate-slide-in-right'>
            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-400 flex item-center gap-2'>
                <User className='size-4' />
                Full Name
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser ? authUser.fullName : " "}</p>
            </div>

            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-400 flex item-center gap-2'>
                <Mail className='size-4' />
                E-mail
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser ? authUser.email : " "}</p>
            </div>
          </div>
        </div>

        <div className='bg-base-300 rounded-xl p-6 space-y-3 mt-3 animate-slide-in-right'>
          <h2 className='text-lg font-medium mb-4'>Account Information</h2>
          <div className='space-y-3 text-sm'>
            <div className=' flex items-center justify-between py-2 border-b border-zinc-700'>
              <span>Member Since</span>
              <span>{authUser.createdAt?.split("T")[0]}</span>
              {/* .split("T")
              This splits the timestamp string at the "T" character. Using our example:
              "2025-05-19T15:45:30.000Z".split("T")*/
              }
            </div>
            <div className=' flex items-center justify-between py-2'>
              <span>
                Account Status
              </span>
              <span className='text-green-500'>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
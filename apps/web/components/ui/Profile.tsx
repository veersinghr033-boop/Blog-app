"use client";

import { useEffect, useMemo, useRef, useState } from "react"; 
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { changePassword, updateProfile } from "@/lib/store/features/authThunk";

import type { UploadProps } from "antd/es/upload/interface";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
const Upload = dynamic(() => import("antd/es/upload/Upload"), { ssr: false });


type FileType = Parameters<NonNullable<UploadProps["beforeUpload"]>>[0];

function Profile() {
  const dispatch = useAppDispatch() as any;
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  const initialValues = useMemo(
    () => ({
      userName: user?.userName || user?.name || user?.userName || "Emma Davis",

      email: user?.email || "emma@blog.com",

      bio: user?.bio || "Tech enthusiast",
    }),
    [user],
  );

  const [userName, setUserName] = useState(initialValues.userName);
  const [email, setEmail] = useState(initialValues.email);
  const [bio, setBio] = useState(initialValues.bio);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  // const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // const [avatarPreview, setAvatarPreview] = useState("");
  // const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setUserName(initialValues.userName);
    setEmail(initialValues.email);
    setBio(initialValues.bio);
  }, [initialValues.userName, initialValues.email, initialValues.bio]);

  const userInitial = useMemo(() => {
    const name = userName || initialValues.userName;

    return name
      .split(" ")
      .map((part: string) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [userName, initialValues.userName]);

  const handleCancel = () => {
    setUserName(initialValues.userName);
    setEmail(initialValues.email);
    setBio(initialValues.bio);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveProfileImage(false);
  };

  const handleRemoveProfileImage = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveProfileImage(true);
    setIsModalOpen(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveProfileImage(false);
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    const resultAction = await dispatch(
      updateProfile({
        userName,
        email,
        bio,
        image: avatarFile,
        removeImage: removeProfileImage,
      })
    );

    if (updateProfile.fulfilled.match(resultAction)) {
      toast.success(
        resultAction.payload?.message ||
        "Profile updated successfully"
      );
    } else {
      toast.error(resultAction.payload as string);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword.trim()) {
      toast.error("Please enter currentPassword");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter new password");
      return;
    }
    if (!confirmPassword.trim()) {
      toast.error("Please enter confirmPassword");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const resultAction = await dispatch(
      changePassword({ currentPassword, newPassword }),
    );

    if (changePassword.fulfilled.match(resultAction)) {
      toast.success(
        resultAction.payload?.message || "Password updated successfully",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(resultAction.payload as string);
    }
  };
  

  return (
    <div className="min-h-screen text-black dark:text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          My Profile
        </h1>

        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile information and settings.
        </p>
      </header>
      <div className="md:flex md:flex-row flex-col flex justify-between gap-6">
        <div className="mx-auto w-full md:max-w-1/2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-lg">
          <h2 className="text-xl ">Profile Information</h2>

          <div className="flex items-center gap-4 mt-4">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {(avatarPreview ||
                (!removeProfileImage && user?.profileImage)) ? (
                <img
                  src={avatarPreview || user?.profileImage}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="bg-gray-700 text-white rounded-full w-20 h-20 flex items-center justify-center text-lg uppercase">
                  {userInitial}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div>
              <h2 className="font-semibold">
                {userName}
              </h2>

              <p className="text-gray-500">
                {email}
              </p>

              <p className="text-gray-500">
                {bio}
              </p>
            </div>
          </div>

          <form className="mt-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">userName</label>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your full name" required className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" disabled className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Enter your bio" rows={2} required className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black dark:bg-gray-400 dark:text-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>

              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800">Cancel</button>
            </div>
          </form>
        </div>
        <div className="mx-auto w-full md:max-w-1/2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-lg">
          <h2 className="text-xl ">Password Change</h2>

          <form className="mt-6" onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white p-2 rounded" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-black dark:bg-gray-400 dark:text-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}>Change Password</button>
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      <ImageUpload
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        avatarPreview={avatarPreview}
        user={user}
        fileInputRef={fileInputRef}
        handleRemoveProfileImage={handleRemoveProfileImage}
        removeProfileImage={removeProfileImage}

      />
    </div >
  );
}

export default Profile;

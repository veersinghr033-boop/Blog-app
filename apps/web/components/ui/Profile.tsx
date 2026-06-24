"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { changePassword, updateProfile } from "@/lib/store/features/authThunk"

import {
    Layout,
    Form,
    Card,
    Avatar,
    Input,
    Button,
    message,
} from "antd"

const { TextArea } = Input

function Profile() {
    const dispatch = useAppDispatch() as any
    const user = useAppSelector((state) => state.auth.user)
    const loading = useAppSelector((state) => state.auth.loading)

    const initialValues = useMemo(
        () => ({
            userName:
                user?.userName ||
                user?.name ||
                user?.userName ||
                "Emma Davis",

            email: user?.email || "emma@blog.com",

            bio: user?.bio || "Tech enthusiast",

        }),
        [user]
    )

    const [userName, setUserName] = useState(initialValues.userName)
    const [email, setEmail] = useState(initialValues.email)
    const [bio, setBio] = useState(initialValues.bio)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        setUserName(initialValues.userName)
        setEmail(initialValues.email)
        setBio(initialValues.bio)
    }, [initialValues.userName, initialValues.email, initialValues.bio])

    const userInitial = useMemo(() => {
        const name = userName || initialValues.userName

        return name
            .split(" ")
            .map((part: string) => part[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }, [userName, initialValues.userName])

    const handleCancel = () => {
        setUserName(initialValues.userName)
        setEmail(initialValues.email)
        setBio(initialValues.bio)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
    }

    const handleSubmit = async () => {
        const resultAction = await dispatch(updateProfile({ userName, email, bio }))

        if (updateProfile.fulfilled.match(resultAction)) {
            message.success(resultAction.payload?.message || "Profile updated successfully")
        } else {
            message.error(resultAction.payload as string)
        }
    }

    const handlePasswordSubmit = async () => {
        if (newPassword !== confirmPassword) {
            message.error("New passwords do not match")
            return
        }

        const resultAction = await dispatch(changePassword({ currentPassword, newPassword }))

        if (changePassword.fulfilled.match(resultAction)) {
            message.success(resultAction.payload?.message || "Password updated successfully")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } else {
            message.error(resultAction.payload as string)
        }
    }

    return (
        <Layout className="min-h-screen bg-gray-100 ">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    My Profile
                </h1>

                <p className="text-gray-600">
                    Manage your profile information and settings.
                </p>
            </header>
            <div className="md:flex md:flex-row flex-col flex justify-between gap-6">
                <Card className="mx-auto w-full md:max-w-1/2!">
                    <h2 className="text-xl font-semibold">
                        Profile Information
                    </h2>

                    <div className="flex items-center gap-4 mt-4">
                        <Avatar size={64}>
                            {userInitial}
                        </Avatar>

                        <div>
                            <h2 className="font-semibold">
                                {userName}
                            </h2>

                            <p>{email}</p>

                            <p>{bio}</p>
                        </div>
                    </div>


                    <Form layout="vertical" className="mt-6" onFinish={handleSubmit}>
                        <Form.Item label="userName">
                            <Input
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value)
                                }
                                placeholder="Enter your full name"
                            />
                        </Form.Item>

                        <Form.Item label="Email" >
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                disabled
                            />
                        </Form.Item>

                        <Form.Item label="Bio">
                            <TextArea
                                value={bio}
                                onChange={(e) =>
                                    setBio(e.target.value)
                                }
                                placeholder="Enter your bio"
                                rows={2}
                            />
                        </Form.Item>

                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-black!"
                                loading={loading}
                            >
                                Save Changes
                            </Button>

                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </Form>

                </Card>
                <Card className="mx-auto w-full md:max-w-1/2">
                    <h2 className="text-xl font-semibold">
                        Password Change
                    </h2>

                    <Form layout="vertical" className="mt-6" onFinish={handlePasswordSubmit}>
                        <Form.Item label="Current Password">
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </Form.Item>
                        <Form.Item label="New Password" >
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </Form.Item>
                        <Form.Item label="Confirm New Password" rules={[
                            {
                                required: true,
                                message:
                                    "Please confirm your new password",
                            },
                            {
                                validator: (_, value) => {
                                    if (value && value !== newPassword) {
                                        return Promise.reject(new Error("Passwords do not match"));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </Form.Item>
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-black!"
                                loading={loading}
                            >
                                Change Password
                            </Button>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </Form>


                </Card>

            </div>

        </Layout>
    )
}

export default Profile
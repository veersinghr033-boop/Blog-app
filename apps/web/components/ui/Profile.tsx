"use client"

import { useState, useMemo, type FormEvent } from "react"
import { useAppSelector } from "@/lib/store/hooks"

import {
    Layout,
    Form,
    Card,
    Avatar,
    Input,
    Button,
} from "antd"

const { TextArea } = Input

function Profile() {
    const user = useAppSelector((state) => state.auth.user)

    const initialValues = useMemo(
        () => ({
            fullName:
                user?.fullName ||
                user?.name ||
                user?.userName ||
                "Emma Davis",

            email: user?.email || "emma@blog.com",

            bio: user?.bio || "Tech enthusiast",

        }),
        [user]
    )

    const [fullName, setFullName] = useState(initialValues.fullName)
    const [email, setEmail] = useState(initialValues.email)
    const [bio, setBio] = useState(initialValues.bio)

    const userInitial = useMemo(() => {
        const name = fullName || initialValues.fullName

        return name
            .split(" ")
            .map((part: string) => part[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase()
    }, [fullName, initialValues.fullName])

    const handleCancel = () => {
        setFullName(initialValues.fullName)
        setEmail(initialValues.email)
        setBio(initialValues.bio)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        console.log({
            fullName,
            email,
            bio,
        })
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
                                {fullName}
                            </h2>

                            <p>{email}</p>

                            <p>{bio}</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6"
                    >
                        <Form layout="vertical">
                            <Form.Item label="Full Name">
                                <Input
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                />
                            </Form.Item>

                            <Form.Item label="Email">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                />
                            </Form.Item>

                            <Form.Item label="Bio">
                                <TextArea
                                    value={bio}
                                    onChange={(e) =>
                                        setBio(e.target.value)
                                    }
                                    placeholder="Enter your bio"
                                    rows={4}
                                />
                            </Form.Item>

                            <div className="flex gap-4">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="bg-black!"
                                >
                                    Save Changes
                                </Button>

                                <Button onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </form>
                </Card>
                <Card className="mx-auto w-full md:max-w-1/2">
                    <h2 className="text-xl font-semibold">
                        Password Change
                    </h2>

                    <Form layout="vertical" className="mt-6">
                        <Form.Item label="Current Password">
                            <Input
                                type="password"
                                placeholder="Enter current password"
                            />
                        </Form.Item>
                        <Form.Item label="New Password">
                            <Input
                                type="password"
                                placeholder="Enter new password"
                            />
                        </Form.Item>
                        <Form.Item label="Confirm New Password">
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                            />
                        </Form.Item>
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-black!"
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
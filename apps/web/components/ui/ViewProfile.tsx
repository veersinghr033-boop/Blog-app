import { Modal, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { toast } from "sonner";
function ViewProfile({ userId, isOpen, setIsOpen }: { userId: string, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["user", userId],
        enabled: isOpen && !!userId,
        queryFn: async () => {
            const res = await api.get(`/users/details/${userId}`);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (isError) {
        toast.error("Failed to fetch user data");
        return null;
    }
    console.log(user)
    const User = user?.user;
    return (
        <Modal
            title="Profile"
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={null}
            centered
        >


            <div >
                {User && (
                    <>
                        <img
                            src={User.profileImage}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover mx-auto"
                        />
                        <h2 className="text-xl font-semibold ">User Name: {User.userName}</h2>
                        <p className="text-gray-600">Email: {User.email}</p>
                        <p className="text-gray-600">Bio: {User.bio}</p>
                    </>
                )}
            </div>
        </Modal>

    )
}

export default ViewProfile;
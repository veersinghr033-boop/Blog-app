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
    const stats = user?.stats;

    const cardData = [
        {
            title: "Total Blogs",
            value: stats?.totalBlogs,
            bg: "bg-blue-100  dark:bg-blue-950",
        },
        {
            title: "Total Views",
            value: stats ?.totalViews,
            bg: "bg-green-100 dark:bg-green-950",
        },
        // {
        //     title: "Engagement",
        //     value: User?.totalComments + User?.totalLikes,
        //     desc: "Likes and comments",
        //     bg: "bg-yellow-100 dark:bg-yellow-950",
        // },
    ];
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 ">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${card.bg} dark:border-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow`}
                    >
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                            {card.title}
                        </h3>

                        <p className="text-2xl font-bold text-black dark:text-white">
                            {card?.value}
                        </p>

                    </div>
                ))}
            </div>
        </Modal>

    )
}

export default ViewProfile;
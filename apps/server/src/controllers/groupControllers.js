    import Group from "../models/GroupModel.js";
    import Chat from "../models/chatModel.js";

    export const createGroup = async(req, res) => {
        try {
            const userId = req.user.id;
            const { groupName, members } = req.body;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            if (!groupName.trim()) {
                return res.status(400).json({ message: "Group name is required" });
            }

            const normalizedMembers = members.map((id) => id.trim()).filter((id) => id);

            const participants = [...new Set([userId, ...normalizedMembers])].sort();

            let chat = await Chat.findOne({ participants });

            if (!chat) {
                chat = await Chat.create({
                    participants,
                    isGroupChat: true,
                });
            }

            const group = await Group.create({
                name: groupName.trim(),
                admin: userId,
                chatId: chat._id,
            });

            res.status(201).json({ message: "Group created successfully", group });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to create group" });
        }
    };

    export const getGroups = async(req, res) => {
        // try {

        // } catch (error) {
        //     console.log(error);
        //     res.status(500).json({ message: "failed to get groups" });
        // }
    };
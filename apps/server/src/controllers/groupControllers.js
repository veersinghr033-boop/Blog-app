import Group from "../models/GroupModel.js";

export const createGroup = async(req, res) => {
    try {
        const userId = req.user.id;
        const { groupName, members } = req.body;

        const group = await Group.create({
            name: groupName,
            admin: userId,
            members: [userId, ...members],
        });
        res
            .status(201)
            .json({ message: "Group created successfully", group: group });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to create group" });
    }
};
import Report from "../models/RepotModel.js";

export const createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId, reason } = req.body;
    console.log(blogId, reason);
    if (!blogId || !reason) {
      return res
        .status(400)
        .json({ message: "Blog ID and reason are required" });
    }
    const newReport = new Report({
      blogId,
      userId,
      reason,
    });
    await newReport.save();
    res.status(201).json({ message: "Report created successfully" });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "blogs",
          localField: "blogId",
          foreignField: "_id",
          as: "blogDetails",
        },
      },
      {
        $unwind: "$blogDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          reason: 1,
          createdAt: 1,
          "blogDetails.title": 1,
          "blogDetails._id": 1,
          "userDetails.userName": 1,
          "userDetails._id": 1,
          "userDetails.role": 1,
        },
      },
    ];

    const reports = await Report.aggregate(pipeline);
    res.status(200).json({ reports, message: "Reports fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import Report from "../models/RepotModel.js";

// CREATE REPORT
export const createReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const { blogId, reason } = req.body;

    if (!blogId || !reason) {
      return res.status(400).json({
        message: "Blog ID and reason are required",
      });
    }

    // Prevent duplicate report
    const existingReport = await Report.findOne({
      blogId,
      userId,
    });

    if (existingReport) {
      return res.status(400).json({
        message: "You already reported this blog",
      });
    }

    const newReport = await Report.create({
      blogId,
      userId,
      reason,
    });

    res.status(201).json({
      report: newReport,
      message: "Report created successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: "blogId",
        select: "title content author",
        populate: {
          path: "author",
          select: "userName role",
        },
      })

      .populate({
        path: "userId",
        select: "userName role",
      });
      // console.log(reports)

    const frontendReadyReports = reports.map((report) => ({
      _id: report._id,
      reason: report.reason,
      createdAt: report.createdAt,
      blogDetails: report.blogId
        ? {
            _id: report.blogId._id,
            title: report.blogId.title,
            content: report.blogId.content,
            author: report.blogId.author,
            createdAt: report.blogId.createdAt,
          }
        : null,
      userDetails: report.userId
        ? {
            _id: report.userId._id,
            userName: report.userId.userName,
            role: report.userId.role,
          }
        : null,
    }));

    res.status(200).json({
      reports: frontendReadyReports,
      message: "Reports fetched successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const UserId = req.user.id;

    const reports = await Report.find()
      .populate({
        path: "blogId",
        select: "title content author",
        populate: {
          path: "author",
          select: "userName role",
        },
      })

      .populate({
        path: "userId",
        select: "userName role",
      });

    const frontendReadyReports = reports.map((report) => ({
      _id: report._id,
      reason: report.reason,
      createdAt: report.createdAt,
      blogDetails: report.blogId
        ? {
            _id: report.blogId._id,
            title: report.blogId.title,
            content: report.blogId.content,
            author: report.blogId.author,
            createdAt: report.blogId.createdAt,
          }
        : null,
      userDetails: report.userId
        ? {
            _id: report.userId._id,
            userName: report.userId.userName,
            role: report.userId.role,
          }
        : null,
    }));

    const filteredReports = frontendReadyReports.filter(
      (report) => report.blogDetails?.author._id.toString() === UserId,
    );

    

    res.status(200).json({
      reports: filteredReports,
      message: "Reports fetched successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;
    const reports = await Report.find({ blogId, userId })
      .populate({
        path: "blogId",
        select: "title content author",
        populate: {
          path: "author",
          select: "userName role",
        },
      })
      .populate({
        path: "userId",
        select: "userName role",
      });
    res.status(200).json({
      reports,
      message: "Reports fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

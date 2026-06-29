import Report from "../models/ReportModel.ts";
import { Request, Response } from "express";

interface Reports {
    _id: any;
    reason: string;
    createdAt: Date;
    blogId: any;
    userId: any;
}
export const createReport = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user?.id;

        const { blogId, reason } = req.body;

        if (!blogId || !reason) {
            return res.status(400).json({
                message: "Blog ID and reason are required",
            });
        }

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

        res.status(200).json({
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

export const getReports = async (req: Request, res: Response) => {
    try {
        const before = req.query.before as string | undefined;
        const limit = Number(req.query.limit) || 10;

        const query: any = {};

        if (before) {
            query.createdAt = {
                $lt: new Date(before),
            };
        }
        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
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
            }).lean();


        const frontendReadyReports = reports.map((report: Reports) => ({
            _id: report._id,
            reason: report.reason,
            createdAt: report.createdAt,
            blogDetails: report.blogId ? {
                _id: report.blogId._id,
                title: report.blogId.title,
                content: report.blogId.content,
                author: report.blogId.author,
                createdAt: report.blogId.createdAt,
            } : null,
            userDetails: report.userId ? {
                _id: report.userId._id,
                userName: report.userId.userName,
                role: report.userId.role,
            } : null,
        }));

        res.status(200).json({
            reports: frontendReadyReports,
            nextCursor:
                frontendReadyReports.length > 0
                    ? frontendReadyReports[
                        frontendReadyReports.length - 1
                    ].createdAt
                    : null,
            message: "Reports fetched successfully",
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const UserId = (req as Request & { user?: { id: string } }).user?.id;
        const before = req.query.before as string | undefined;
        const limit = Number(req.query.limit) || 10;

        const query: any = {};

        if (before) {
            query.createdAt = {
                $lt: new Date(before),
            };
        }
        const reports = await Report.find(query )
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
            }).sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const frontendReadyReports = reports.map((report: Reports) => ({
            _id: report._id,
            reason: report.reason,
            createdAt: report.createdAt,
            blogDetails: report.blogId ? {
                _id: report.blogId._id,
                title: report.blogId.title,
                content: report.blogId.content,
                author: report.blogId.author,
                createdAt: report.blogId.createdAt,
            } : null,
            userDetails: report.userId ? {
                _id: report.userId._id,
                userName: report.userId.userName,
                role: report.userId.role,
            } : null,
        }));

        const filteredReports = frontendReadyReports.filter(
            (report) => report.blogDetails && report.blogDetails.author._id.toString() === UserId,
        );



        res.status(200).json({
            reports: filteredReports,
            nextCursor:
                frontendReadyReports.length > 0
                    ? frontendReadyReports[
                          frontendReadyReports.length - 1
                      ].createdAt
                    : null,            message: "Reports fetched successfully",
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const deleteReport = async (req: Request, res: Response) => {
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

export const getByUserId = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user?.id;
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
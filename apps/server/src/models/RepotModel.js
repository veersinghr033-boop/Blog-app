import mongoose from "mongoose"

const ReportSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const Report = mongoose.model("Report", ReportSchema)
export default Report
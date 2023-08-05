const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Types.ObjectId, ref: "blogCategories" },
    view: { type: Number, default: 0 },
    likes: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    disLikes: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    images: { type: String, default: "https://th.bing.com/th/id/R.64c9911597f60d39c29f491a00bcf7ac?rik=MQOg3F7FVix0iA&riu=http%3a%2f%2finsight.economatica.com%2fwp-content%2fuploads%2f2020%2f06%2f20200601_ECO_Thumb_BLOG.png&ehk=gUlqBWo1u7jESigXJEgnoM7ruufVpg54Ca5Yjrvyi6U%3d&risl=&pid=ImgRaw&r=0" },
    author: { type: String, default: "Admin" }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

const BlogModel = mongoose.model("blogs", BlogSchema)

module.exports = BlogModel;
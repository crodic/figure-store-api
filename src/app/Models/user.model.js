const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, min: 6, max: 24 },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    cart: [{
        product: { type: mongoose.Types.ObjectId, ref: "products" },
        quantity: Number, origin: String
    }],
    address: { type: String },
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "products" }],
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordChangeAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpired: { type: String },
}, {
    timestamps: true
})

// Hash Password before save User
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
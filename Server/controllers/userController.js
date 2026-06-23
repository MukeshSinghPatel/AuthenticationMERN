const User = require("../models/User");


exports.getUserData = async(req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if(!user) {
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}
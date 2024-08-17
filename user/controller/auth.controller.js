const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const config = require("../../config/config");
const UserModel = require("../../models/users.model");
const { handleErrorResponse, CustomErrorHandler } = require("../../middleware/CustomErrorHandler");


module.exports.signUp = async (request, response) => {
    try {
        const { fullName, email, mobile, password, cnfPassword } = request.body;
   
        const checkEmail = await UserModel.findOne(
            { 
                where: { email }
            }
        );
        if(checkEmail) throw CustomErrorHandler.alreadyExist("Your Email Is Already Registered");

        const checkMobile = await UserModel.findOne(
            { 
                where: { mobile }
            }
        );
        if (checkMobile) throw CustomErrorHandler.alreadyExist("Your Mobile Is Already Registered");

        if (password !== cnfPassword) {
            throw CustomErrorHandler.wrongCredentials("Confirm password not match");
        };

        //GENERATING PASSWORD
        const passwordSalt = await bcrypt.genSalt(Number(config.SALT_ROUND));
        const passwordHash = await bcrypt.hash(password, passwordSalt);

        const newUsers = await UserModel.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile,
            password: passwordHash,
        });

        //jwt tokens
        const token = jwt.sign(JSON.stringify(newUsers), config.JWT_AUTH_TOKEN);

        delete newUsers.password;
        const sendData = { userData: newUsers, token: token };

        return response.status(200).json({
            status: true,
            message: "Register successfully",
            data: sendData,
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.login = async (request, response) => {
    try {
        const { email, mobile, password } = request.body;

        const conditions = [];

        if (email) {
            conditions.push({
                email: email.toLowerCase().trim(),
                isDeleted: false,
            });
        }

        if (mobile) {
            conditions.push({
                mobile: mobile,
                isDeleted: false,
            });
        }

        const userData = await UserModel.findOne({
            where: {
                [Sequelize.Op.or]: conditions,
            },
        });
        if (!userData) {
            throw CustomErrorHandler.wrongCredentials(mobile ? "Mobile not found!" : "Email not found!");
        };

        // if (!userData.isEmailVerified) {
        //     throw CustomErrorHandler.unAuthorized("Email Not verified!");
        // };

        // if (!userData.isMobileVerified) {
        //     throw CustomErrorHandler.unAuthorized("Mobile not verified!");
        // };

        const checkPassword = await bcrypt.compare(password, userData.password);
        if (!checkPassword) {
            throw CustomErrorHandler.wrongCredentials("Wrong Password");
        };

        userData.lastLogin = Math.floor(Date.now() / 1000);
        await userData.save();

        // const sanitizedUserData = { ...userData };
        // delete sanitizedUserData.password;
        delete userData.password;

        const token = jwt.sign(JSON.stringify(userData), config.JWT_AUTH_TOKEN);

        return response.json({
            status: true,
            message: "Login success.",
            data: { userData, token },
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};


// All Below mentioned API working with mongodb Database
module.exports.sendOtp = async (request, response) => {
    try {
        const { mobile, email } = request.body;

        const userData = await UserModel.findOne({
            $or: [
                { 
                    email: email?email.toLowerCase().trim():email, 
                    isDeleted: false, 
                },
                { 
                    mobile: mobile, 
                    isDeleted: false, 
                }
            ]
        });
        if (!userData) {
            throw CustomErrorHandler.wrongCredentials(mobile ? "Mobile not found!" : "Email not found!");
        };

        return response.status(200).json({
            status: res,
            message: mobile?"Otp Send on Mobile.":"Otp Send on Email.",
            data: "",
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.verifyOtp = async (request, response) => {
    try {
        const { mobile, email, otp } = request.body;

        const userData = await UserModel.findOne({
            $or: [
                { 
                    email: email?email.toLowerCase().trim():email, 
                    isDeleted: false, 
                },
                { 
                    mobile: mobile, 
                    isDeleted: false, 
                }
            ]
        });
        if (!userData) {
            throw CustomErrorHandler.wrongCredentials(mobile ? "Mobile not found!" : "Email not found!");
        };

        if(mobile){
            userData.isMobileVerified = true;
        } else {
            userData.isEmailVerified = true;
        };
        await userData.save();

        return response.status(200).json({
            status: res,
            message: mobile?"Mobile Verified.":"Email Verified.",
            data: "",
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.changePassword = async (request, response) => {
    try {
        const { user, oldPassword, newPassword, cnfPassword } = request.body;

        const userData = await UserModel.findOne({
            _id: user._id,
            isDeleted: false
        }).select("+password");
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");
        
        if(newPassword !== cnfPassword){
            throw CustomErrorHandler.unAuthorized("Not Match Confirm Password!");
        }

        const checkPassword = await bcrypt.compare(oldPassword, userData.password);
        if(!checkPassword) throw CustomErrorHandler.wrongCredentials("Not Match Current Password!");

        const passwordSalt = await bcrypt.genSalt(Number(config.SALT_ROUND));
        const passwordHash = await bcrypt.hash(newPassword, passwordSalt);
        
        userData.password = passwordHash;
        await userData.save()

        return response.status(200).json({
            status: true,
            message: "Password Changed.",
            data: "",
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.forgetPasswordVerifyOtp = async (request, response) => {
    try {
        const { mobile, email, otp } = request.body;

        const userData = await UserModel.findOne({
            $or: [
                { 
                    email: email?email.toLowerCase().trim():email, 
                    isDeleted: false, 
                },
                { 
                    mobile: mobile, 
                    isDeleted: false, 
                }
            ]
        });
        if (!userData) {
            throw CustomErrorHandler.wrongCredentials(mobile ? "Mobile not found!" : "Email not found!");
        };

        const sanitizedUserData = { ...userData.toObject() };
        delete sanitizedUserData.kyc;
        delete sanitizedUserData.eSign;
        delete sanitizedUserData.password;

        const token = jwt.sign(JSON.stringify(sanitizedUserData), config.JWT_AUTH_TOKEN);

        return response.json({
            status: true,
            message: "Use this Token for Reset Password.",
            data: token,
        });  
    } catch (e) {
        handleErrorResponse(e, response);
    };
};

module.exports.resetPassword = async (request, response) => {
    try {
        const { user, newPassword, cnfPassword } = request.body;
        
        const userData = await UserModel.findOne({
            _id: user._id,
            isDeleted: false,
        });
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");

        if(newPassword !== cnfPassword){
            throw CustomErrorHandler.unAuthorized("Not Match Confirm Password!");
        };

        const passwordSalt = await bcrypt.genSalt(Number(config.SALT_ROUND));
        const passwordHash = await bcrypt.hash(newPassword, passwordSalt);
        userData.password = passwordHash;
        userData.save();
        
        return response.status(200).json({
            status: true,
            message: "Success Reset Password.",
            data: "",
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};
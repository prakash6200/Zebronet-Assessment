const Joi = require("joi");

module.exports.signUp = async (request, response, next) => {
    const rules = Joi.object({
        fullName: Joi.string().min(3).max(40).required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
        password: Joi.string().min(8).max(30)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // At least one digit, one lowercase, and one uppercase letter
            .message('Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character!')
            .required(),
        cnfPassword: Joi.string().valid(Joi.ref('password')).required(),
    });
    
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

module.exports.login = async (request, response, next) => {
    const rules = Joi.object().keys({
        email: Joi.string().email(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/),
        password: Joi.string().min(8).max(30)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // At least one digit, one lowercase, and one uppercase letter
            .message('Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character.')
            .required(),
    }).or('email', 'mobile');
    const { error } = rules.validate(request.body);

    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    }
    return next();
};

module.exports.sendOtp = async (request, response, next) => {
    const rules = Joi.object().keys({
        email: Joi.string().email(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/),
    }).or('email', 'mobile');
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

module.exports.verifyOtp = async (request, response, next) => {
    const rules = Joi.object().keys({
        email: Joi.string().email(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/),
        otp: Joi.number().required(),
    }).or('email', 'mobile');
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

module.exports.changePassword = async (request, response, next) => {
    const rules = Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).max(30)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // At least one digit, one lowercase, and one uppercase letter
            .message('Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character.')
            .required(),
        cnfPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
    });
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

module.exports.forgetPasswordVerifyOtp = async (request, response, next) => {
    const rules = Joi.object().keys({
        email: Joi.string().email(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/),
        otp: Joi.number().required(),
    }).or('email', 'mobile');
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

module.exports.resetPassword = async (request, response, next) => {
    const rules = Joi.object().keys({
        newPassword: Joi.string().min(8).max(30)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // At least one digit, one lowercase, and one uppercase letter
            .message('Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character.')
            .required(),
        cnfPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
    });
    const { error } = rules.validate(request.body);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        return next();
    }
};

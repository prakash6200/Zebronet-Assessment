const Joi = require("joi");

module.exports.addContent = (request, response, next) => {
    const rules = Joi.object().keys({
        courseName: Joi.string().min(3).max(40).required(),
        courseDescription: Joi.string().min(3).required(),
        lessons: Joi.array().required()
    });

    const { error } = rules.validate(request.body);

    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        next();
    }
};

module.exports.updateContent = (request, response, next) => {
    const rules = Joi.object().keys({
        contentId: Joi.number().min(1).required(),
        courseName: Joi.string().min(3).max(40).optional(),
        courseDescription: Joi.string().min(3).optional(),
        lessons: Joi.array().optional()
    });

    const { error } = rules.validate(request.body);

    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        next();
    }
};

module.exports.deleteContent = (request, response, next) => {
    const rules = Joi.object().keys({
        contentId: Joi.number().min(1).required(),
    });

    const { error } = rules.validate(request.body);

    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        next();
    }
};

module.exports.contentList = (request, response, next) => {
    const rules = Joi.object().keys({
        page: Joi.number().optional(),
        sizePerPage: Joi.number().optional(),
        search: Joi.string().optional(),
    });
    const { error } = rules.validate(request.query);
    if (error) {
        return response
            .status(422)
            .json({ status: false, message: error.message, data: null });
    } else {
        next();
    }
};
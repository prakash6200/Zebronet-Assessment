const redis = require('redis');
const redisClient = redis.createClient();
const { Sequelize } = require("sequelize");
const UserModel = require("../../models/users.model");
const Pagination = require("../../utils/paginate.util");
const ContentModel = require("../../models/content.model");
const { handleErrorResponse, CustomErrorHandler } = require("../../middleware/CustomErrorHandler");


module.exports.addContent = async (request, response) => {
    try {
        const { user, courseName, courseDescription, lessons } = request.body;

        const userData = await UserModel.findOne({
            where: {
                id: user.id,
                isDeleted: false,
            }
        });
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");

        const newContent = await ContentModel.create({
            courseName, 
            courseDescription, 
            lessons
        })

        return response.json({
            status: true,
            message: "New Content Added.",
            data: newContent,
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.updateContent = async (request, response) => {
    try {
        const { user, contentId, courseName, courseDescription, lessons } = request.body;

        const userData = await UserModel.findOne({
            where: {
                id: user.id,
                isDeleted: false,
            }
        });
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");

        const checkContent = await ContentModel.findOne(
            { where: { id: contentId, isDeleted: false } }
        );
        if(!checkContent) throw CustomErrorHandler.notFound(`Content with ${contentId} Not Found!`);

        // Update content
        checkContent.courseName = courseName || checkContent.courseName;
        checkContent.courseDescription = courseDescription || checkContent.courseDescription;
        checkContent.lessons = lessons || checkContent.lessons;
        await checkContent.save();

        return response.json({
            status: true,
            message: "Updated Content Details.",
            data: checkContent,
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.deleteContent = async (request, response) => {
    try {
        const { user, contentId } = request.body;

        const userData = await UserModel.findOne({
            where: {
                id: user.id,
                isDeleted: false,
            }
        });
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");

        const checkContent = await ContentModel.findOne(
            { where: { id: contentId, isDeleted: false } }
        );
        if(!checkContent) throw CustomErrorHandler.notFound(`Content with ${contentId} Not Found!`);
        
        checkContent.isDeleted = true;
        await checkContent.save();

        return response.json({
            status: true,
            message: `Content with ${contentId} Deleted.`,
            data: checkContent,
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

module.exports.listContent = async (request, response) => {
    try {
        const { user } = request.body;
        const {  page = 1, sizePerPage = 10, search = "" } = request.query;

        const userData = await UserModel.findOne({
            where: {
                id: user.id,
                isDeleted: false,
            }
        });
        if(!userData) throw CustomErrorHandler.unAuthorized("Access Denied!");

        const searchCriteria = search ? {
            [Sequelize.Op.or]: [
                { courseName: { [Sequelize.Op.like]: `%${search}%` } },
                { courseDescription: { [Sequelize.Op.like]: `%${search}%` } }
            ]
        } : {};

        const options = {
            where: { 
                isDeleted: false,
                ... searchCriteria
            },
            order: [["createdAt", "DESC"]],
        };

        const data = await Pagination.paginate(
            ContentModel,
            options,
            page,
            sizePerPage,
        );

        return response.json({
            status: true,
            message: "Content List.",
            data: data,
        });
    } catch (e) {
        handleErrorResponse(e, response);
    }
};

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports.cachingSearch = async (request, response) => {
    try {
        const { user } = request.body;
        const { page = 1, sizePerPage = 10, search = "" } = request.query;

        const userData = await UserModel.findOne({
            where: {
                id: user.id,
                isDeleted: false,
            }
        });
        if (!userData) {
            throw CustomErrorHandler.unAuthorized("Access Denied!");
        }

        const cacheKey = `content:${page}:${sizePerPage}:${search}`;
        
        redisClient.get(cacheKey, async (err, cachedData) => {
            if (err) {
                console.error('Redis error during get:', err);
                return handleErrorResponse(err, response);
            }

            if (cachedData) {
                return response.json({
                    status: true,
                    message: "Content List (from cache).",
                    data: JSON.parse(cachedData),
                });
            } else {
                try {
                    const searchCriteria = search ? {
                        [Sequelize.Op.or]: [
                            { courseName: { [Sequelize.Op.like]: `%${search}%` } },
                            { courseDescription: { [Sequelize.Op.like]: `%${search}%` } }
                        ]
                    } : {};

                    const options = {
                        where: {
                            isDeleted: false,
                            ...searchCriteria,
                        },
                        order: [["createdAt", "DESC"]],
                    };

                    const data = await Pagination.paginate(
                        ContentModel,
                        options,
                        page,
                        sizePerPage
                    );

                    redisClient.setex(cacheKey, 600, JSON.stringify(data));

                    return response.json({
                        status: true,
                        message: "Content List.",
                        data: data,
                    });
                } catch (e) {
                    console.error('Error during database query:', e);
                    return handleErrorResponse(e, response);
                }
            }
        });
    } catch (e) {
        console.error('Error in listContent function:', e);
        return handleErrorResponse(e, response);
    }
};
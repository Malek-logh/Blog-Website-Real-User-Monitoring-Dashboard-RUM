const asyncErrorWrapper = require("express-async-handler");
const Story = require("../Models/story");
const deleteImageFile = require("../Helpers/Libraries/deleteImageFile");
const { searchHelper, paginateHelper } = require("../Helpers/query/queryHelpers");
const { sendEventToGA4 } = require("../Helpers/Libraries/ga4Tracker"); // Import GA4 tracker

const addStory = asyncErrorWrapper(async (req, res, next) => {
    const { title, content } = req.body;
    const wordCount = content.trim().split(/\s+/).length;
    const readtime = Math.floor(wordCount / 200);

    const startTime = Date.now(); // Start timing
    try {
        const newStory = await Story.create({
            title,
            content,
            author: req.user._id,
            image: req.savedStoryImage,
            readtime
        });

        const duration = (Date.now() - startTime) ; // Calculate duration in seconds

        // Track story addition
        await sendEventToGA4({
            name: 'add_story',
            params: {
                user_id: req.user._id.toString(),
                story_id: newStory._id.toString(),
                title: title,
                readtime: readtime,
                duration: duration
            }
        });

        return res.status(200).json({
            success: true,
            message: "Story added successfully",
            data: newStory
        });
    } catch (error) {
        deleteImageFile(req);
        return next(error);
    }
});

const getAllStories = asyncErrorWrapper(async (req, res, next) => {
    const startTime = Date.now(); // Start timing
    let query = Story.find();
    query = searchHelper("title", query, req);
    const paginationResult = await paginateHelper(Story, query, req);
    query = paginationResult.query.sort("-likeCount -commentCount -createdAt");
    const stories = await query;

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track fetching all stories
    await sendEventToGA4({
        name: 'fetch_all_stories',
        params: {
            count: stories.length,
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        count: stories.length,
        data: stories,
        page: paginationResult.page,
        pages: paginationResult.pages
    });
});

const detailStory = asyncErrorWrapper(async (req, res, next) => {
    const { slug } = req.params;
    const { activeUser } = req.body;

    const startTime = Date.now(); // Start timing
    const story = await Story.findOne({ slug: slug }).populate("author likes");
    const storyLikeUserIds = story.likes.map(json => json._id.toString());
    const likeStatus = storyLikeUserIds.includes(activeUser._id);

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track fetching story details
    await sendEventToGA4({
        name: 'fetch_story_details',
        params: {
            user_id: activeUser._id.toString(),
            story_id: story._id.toString(),
            likeStatus: likeStatus,
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        data: story,
        likeStatus: likeStatus
    });
});

const likeStory = asyncErrorWrapper(async (req, res, next) => {
    const { activeUser } = req.body;
    const { slug } = req.params;

    const startTime = Date.now(); // Start timing
    const story = await Story.findOne({ slug: slug }).populate("author likes");
    const storyLikeUserIds = story.likes.map(json => json._id.toString());

    if (!storyLikeUserIds.includes(activeUser._id)) {
        story.likes.push(activeUser);
        story.likeCount = story.likes.length;
        await story.save();
    } else {
        const index = storyLikeUserIds.indexOf(activeUser._id);
        story.likes.splice(index, 1);
        story.likeCount = story.likes.length;
        await story.save();
    }

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track story like/unlike
    await sendEventToGA4({
        name: 'like_story',
        params: {
            user_id: activeUser._id.toString(),
            story_id: story._id.toString(),
            likeStatus: story.likes.includes(activeUser._id),
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        data: story
    });
});

const editStoryPage = asyncErrorWrapper(async (req, res, next) => {
    const { slug } = req.params;
    const startTime = Date.now(); // Start timing
    const story = await Story.findOne({ slug: slug }).populate("author likes");

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track fetching edit story page
    await sendEventToGA4({
        name: 'fetch_edit_story_page',
        params: {
            story_id: story._id.toString(),
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        data: story
    });
});

const editStory = asyncErrorWrapper(async (req, res, next) => {
    const { slug } = req.params;
    const { title, content, image, previousImage } = req.body;

    const startTime = Date.now(); // Start timing
    const story = await Story.findOne({ slug: slug });
    story.title = title;
    story.content = content;
    story.image = req.savedStoryImage || image;

    if (req.savedStoryImage) {
        deleteImageFile(req, previousImage);
    }

    await story.save();

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track story edit
    await sendEventToGA4({
        name: 'edit_story',
        params: {
            story_id: story._id.toString(),
            title: title,
            content_length: content.length,
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        data: story
    });
});

const deleteStory = asyncErrorWrapper(async (req, res, next) => {
    const { slug } = req.params;
    const startTime = Date.now(); // Start timing
    const story = await Story.findOne({ slug: slug });

    deleteImageFile(req, story.image);
    await story.remove();

    const duration = (Date.now() - startTime) ; // Calculate duration in seconds

    // Track story deletion
    await sendEventToGA4({
        name: 'delete_story',
        params: {
            story_id: story._id.toString(),
            duration: duration
        }
    });

    return res.status(200).json({
        success: true,
        message: "Story deleted successfully"
    });
});

module.exports = {
    addStory,
    getAllStories,
    detailStory,
    likeStory,
    editStoryPage,
    editStory,
    deleteStory
};

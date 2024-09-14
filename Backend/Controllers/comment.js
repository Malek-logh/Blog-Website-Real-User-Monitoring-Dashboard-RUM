const asyncErrorWrapper = require("express-async-handler");
const Story = require("../Models/story");
const Comment = require("../Models/comment");
const { sendEventToGA4 } = require("../Helpers/Libraries/ga4Tracker"); // Import GA4 tracker

const addNewCommentToStory = asyncErrorWrapper(async (req, res, next) => {
    const start = Date.now(); // Start timing

    const { slug } = req.params;
    const { star, content } = req.body;

    const story = await Story.findOne({ slug: slug });

    const comment = await Comment.create({
        story: story._id,
        content: content,
        author: req.user.id,
        star: star
    });

    story.comments.push(comment._id);
    story.commentCount = story.comments.length;
    await story.save();

    // Track adding new comment
    await sendEventToGA4({
        name: 'add_new_comment',
        params: {
            user_id: req.user.id,
            story_id: story._id.toString(),
            comment_id: comment._id.toString(),
            star: star,
            duration: (Date.now() - start)  // Convert duration to seconds
        }
    });

    return res.status(200).json({
        success: true,
        data: comment
    });
});

const getAllCommentByStory = asyncErrorWrapper(async (req, res, next) => {
    const start = Date.now(); // Start timing

    const { slug } = req.params;

    const story = await Story.findOne({ slug: slug });

    const commentList = await Comment.find({
        story: story._id
    }).populate({
        path: "author",
        select: "username photo"
    }).sort("-createdAt");

    // Track fetching all comments
    await sendEventToGA4({
        name: 'fetch_all_comments',
        params: {
            story_id: story._id.toString(),
            comment_count: commentList.length,
            duration: (Date.now() - start)  // Convert duration to seconds
        }
    });

    return res.status(200).json({
        success: true,
        count: story.commentCount,
        data: commentList
    });
});

const commentLike = asyncErrorWrapper(async (req, res, next) => {
    const start = Date.now(); // Start timing

    const { activeUser } = req.body;
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment.likes.includes(activeUser._id)) {
        comment.likes.push(activeUser._id);
        comment.likeCount = comment.likes.length;
        await comment.save();
    } else {
        const index = comment.likes.indexOf(activeUser._id);
        comment.likes.splice(index, 1);
        comment.likeCount = comment.likes.length;
        await comment.save();
    }

    const likeStatus = comment.likes.includes(activeUser._id);

    // Track liking/unliking comment
    await sendEventToGA4({
        name: 'comment_like',
        params: {
            user_id: activeUser._id.toString(),
            comment_id: comment._id.toString(),
            like_status: likeStatus,
            duration: (Date.now() - start)  // Convert duration to seconds
        }
    });

    return res.status(200).json({
        success: true,
        data: comment,
        likeStatus: likeStatus
    });
});

const getCommentLikeStatus = asyncErrorWrapper(async (req, res, next) => {
    const start = Date.now(); // Start timing

    const { activeUser } = req.body;
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);
    const likeStatus = comment.likes.includes(activeUser._id);

    // Track getting comment like status
    await sendEventToGA4({
        name: 'get_comment_like_status',
        params: {
            user_id: activeUser._id.toString(),
            comment_id: comment._id.toString(),
            like_status: likeStatus,
            duration: (Date.now() - start)   // Convert duration to seconds
        }
    });

    return res.status(200).json({
        success: true,
        likeStatus: likeStatus
    });
});

module.exports = {
    addNewCommentToStory,
    getAllCommentByStory,
    commentLike,
    getCommentLikeStatus
};

const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require('./models/campground')
const Review = require('./models/review');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({
   storage,
   limits: { fileSize: 500000 } 
});

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to perform that!');
        return res.redirect(`/campgrounds/${id}`);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next) => {
    const {reviewId,id} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to perform that!')
        return res.redirect(`/campgrounds/${id}`)
    }else {
        next()
    }
}

module.exports.uploadFile  = (req, res, next) => {
    const {id} = req.params;
    const uploadProcess = upload.array('image');
    uploadProcess(req, res, err => {
      if(err instanceof multer.MulterError){
        if (err.code === "LIMIT_FILE_SIZE"){
            req.flash('error','File Too Large! Maximum is 500KB!')
            if(id) {
                return res.redirect(`/campgrounds/${id}/edit`);
            }else {
                return res.redirect('/campgrounds/new');
            }
        }else if(err) {
            req.flash('error','Something Went Wrong!');
            return next(new Error(err, 400));
            }
        }
    next();
   });
};




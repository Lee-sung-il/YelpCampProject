const Campground = require('../models/campground');
const moment = require('moment');
const {cloudinary} = require('../cloudinary');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const MapToken = process.env.OPENCAGE_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
  const location = req.body.campground.location;
  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${MapToken}`);
  const geoData = await geoRes.json();

  if (!geoData.results.length) {
    req.flash('error', 'Could not geocode location.');
    return res.redirect('/campgrounds/new');
  }

  const { lat, lng } = geoData.results[0].geometry;

  const campground = new Campground(req.body.campground);
  campground.geometry = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'successfully made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect(`/campgrounds`);
  }
  res.render('campgrounds/show', { campground,  moment });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect(`/campgrounds`);
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const location = req.body.campground.location;
  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${MapToken}`);
  const geoData = await geoRes.json();

  if (!geoData.results.length) {
    req.flash('error', 'Could not geocode new location.');
    return res.redirect(`/campgrounds/${id}/edit`);
  }

  const { lat, lng } = geoData.results[0].geometry;

  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const img =req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(... img);
  await campground.save();
  campground.geometry = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    console.log(campground)
  }
  req.flash('success', 'successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground!');
  res.redirect(`/campgrounds`);
};

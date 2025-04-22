const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
  if (this.url.includes('cloudinary.com')) {
    // Cloudinary 이미지일 경우
    return this.url.replace('/upload/', '/upload/w_200/');
  } else if (this.url.includes('unsplash.com')) {
    // Unsplash 이미지일 경우
    if (this.url.includes('w=')) {
      // 이미 w 값이 있을 경우 변경
      return this.url.replace(/w=\d+/, 'w=200');
    } else {
      // 없으면 w=200 추가
      return this.url + '&w=200';
    }
  } else {
    // 기타 이미지일 경우 원본 유지
    return this.url;
  }
});

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  },
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
<p>${this.description.substring(0, 20)}...</p>
`;
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);

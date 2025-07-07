import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  paragraph: { type: String, required: true },
  image: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    image: { type: String, required: true }
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one tag is required'
    },
    required: true
  },
  publishDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
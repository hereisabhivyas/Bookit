import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;

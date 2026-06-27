import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General', index: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: '🧴' }, // emoji or image URL
    stock: { type: Number, required: true, min: 0, default: 0 },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

// Convenience flag used by the client.
productSchema.virtual('inStock').get(function inStock() {
  return this.available && this.stock > 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

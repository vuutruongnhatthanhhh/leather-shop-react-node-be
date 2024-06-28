const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        // có required true là bắt buộc phải có
        name: { type: String, required: true, unique: true },
        // Link lưu ảnh
        image: { type: String, required: true },
        type: { type: String, required: true },
        price: { type: Number, required: true },
        // Số lượng sản phẩm còn trong kho
        countInStock: { type: Number, required: true },
        rating: { type: Number},
        description: { type: String },
        discount: { type: Number },
        selled: { type: Number }
    },
    {
        timestamps: true,
    }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
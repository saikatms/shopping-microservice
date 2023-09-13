const mongoose = require('mongoose');
 
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    customerId: { type: String },
    items: [
        {   
            product: {
                id: { type: String, require: true },
                name: { type: String },
                img: { type: String },
                unit: { type: Number },
                price: { type: Number },
            } ,
            unit: { type: Number, require: true} 
        }
    ]
},
{
    timestamps: true,
    versionKey: false
});

module.exports =  mongoose.model('cart', CartSchema);
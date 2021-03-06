import mongoose from 'mongoose';

let url;
if (process.env.MONGODB_URI) {
    url = process.env.MONGODB_URI;
} else {
    url = "mongodb://localhost:27017/test";
}
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const contactSchema = new mongoose.Schema({
    _id : String, 
    name: String,
    tel: String,
    address: String,
    photo:String
})

const photoSchema = new mongoose.Schema({
    _id: String,
    image: Buffer, 
    mimetype: String 
})

if (!contactSchema.options.toObject) {
    contactSchema.options.toObject = {};
}

contactSchema.set('toObject', {
    transform: function (doc, ret) {
      ret.no = ret._id
      delete ret._id
      delete ret.__v
    }
})

contactSchema.index({ name:1 })
photoSchema.index({ contact_id:1 })

const Contact = mongoose.model("contacts", contactSchema);
const Photo = mongoose.model("photos", photoSchema);

export { Contact, Photo, mongoose };

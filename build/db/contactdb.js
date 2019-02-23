import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/contactsdb', { useNewUrlParser: true });
//mlab 연결정보
//mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })

const contactSchema = new mongoose.Schema({
    _id: String,
    name: String,
    tel: String,
    address: String,
    photo: String
});

const photoSchema = new mongoose.Schema({
    _id: String,
    image: Buffer,
    mimetype: String
});

contactSchema.index({ name: 1 });
photoSchema.index({ contact_id: 1 });

const Contact = mongoose.model("contacts", contactSchema);
const Photo = mongoose.model("photos", photoSchema);

export { Contact, Photo, mongoose };
//# sourceMappingURL=contactdb.js.map
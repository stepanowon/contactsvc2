'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mongoose = exports.Photo = exports.Contact = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let url;
if (process.env.MONGODB_URI) {
    url = process.env.MONGODB_URI;
} else {
    url = "mongodb://localhost:27017/test";
}
_mongoose2.default.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const contactSchema = new _mongoose2.default.Schema({
    _id: String,
    name: String,
    tel: String,
    address: String,
    photo: String
});

const photoSchema = new _mongoose2.default.Schema({
    _id: String,
    image: Buffer,
    mimetype: String
});

if (!contactSchema.options.toObject) {
    contactSchema.options.toObject = {};
}

contactSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.no = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

contactSchema.index({ name: 1 });
photoSchema.index({ contact_id: 1 });

const Contact = _mongoose2.default.model("contacts", contactSchema);
const Photo = _mongoose2.default.model("photos", photoSchema);

exports.Contact = Contact;
exports.Photo = Photo;
exports.mongoose = _mongoose2.default;
//# sourceMappingURL=testdb.js.map
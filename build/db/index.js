'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.changePhoto = exports.getPhotoImage = exports.deleteContact = exports.updateContact = exports.batchInsertContacts = exports.insertContact = exports.searchContact = exports.contactsAll = exports.contactOne = undefined;

var _mongodb = require('mongodb');

var _testdb = require('./testdb');

var _constant = require('../constant');

var _constant2 = _interopRequireDefault(_constant);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const contactOne = exports.contactOne = (() => {
    var _ref = _asyncToGenerator(function* ({ no, baseUrl }) {
        if (typeof no !== "string" && no == "") no = "not passed";
        let doc = yield _testdb.Contact.findById(no);
        if (doc) {
            doc.photo = baseUrl + _constant2.default.PHOTO_URL + doc.photo;
            return doc;
        }
        return { status: "fail", message: "연락처 정보 없음" };
    });

    return function contactOne(_x) {
        return _ref.apply(this, arguments);
    };
})();

const contactsAll = exports.contactsAll = (() => {
    var _ref2 = _asyncToGenerator(function* ({ pageno, pagesize, baseUrl }) {
        if (typeof pageno !== "number" || pageno < 0) pageno = 0;
        if (typeof pagesize !== "number") pagesize = 5;
        let contacts;
        if (pageno === 0) {
            pagesize = 0;
            contacts = yield _testdb.Contact.find().sort({ _id: -1 });
        } else {
            contacts = yield _testdb.Contact.find().sort({ _id: -1 }).skip((pageno - 1) * pagesize).limit(pagesize);
        }
        contacts = contacts.map(function (c, index) {
            let { _id, name, tel, address, photo } = c;
            return { no: _id, name, tel, address, photo: baseUrl + _constant2.default.PHOTO_URL + photo };
        });
        let count = yield _testdb.Contact.countDocuments();
        return { pageno, pagesize, totalcount: count, contacts };
    });

    return function contactsAll(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

const searchContact = exports.searchContact = (() => {
    var _ref3 = _asyncToGenerator(function* ({ name, baseUrl }) {
        let contacts = yield _testdb.Contact.find({ name: new RegExp(name, "i") }).sort({ name: 1 });
        contacts = contacts.map(function (c, index) {
            let { _id, name, tel, address, photo } = c;
            return { no: _id, name, tel, address, photo: baseUrl + _constant2.default.PHOTO_URL + photo };
        });
        return contacts;
    });

    return function searchContact(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

const insertContact = exports.insertContact = (() => {
    var _ref4 = _asyncToGenerator(function* ({ name, tel, address, photo }) {
        if (typeof photo === "undefined" || photo == null) {
            photo = 'noimage';
        }
        let _id = new _mongodb.ObjectId().toHexString();
        let c1 = new _testdb.Contact({
            _id, name, tel, address, photo
        });
        let doc = yield c1.save();
        if (doc) return { status: "success", message: "연락처 추가 성공", no: doc._id };else return { status: "fail", message: "연락처 추가 실패" };
    });

    return function insertContact(_x4) {
        return _ref4.apply(this, arguments);
    };
})();

const batchInsertContacts = exports.batchInsertContacts = (() => {
    var _ref5 = _asyncToGenerator(function* ({ contacts }) {
        const result = { status: "", message: "", no: [] };
        let count = 0;
        try {
            for (let i = 0; i < contacts.length; i++) {
                let { name, tel, address } = contacts[i];
                let doc = yield insertContact({ name, tel, address });
                if (doc.status === "ok") {
                    result.no.push(doc.no);
                    count++;
                }
            }
            result.status = "success";
            result.message = count + "건의 데이터 추가 성공";
            return result;
        } catch (e) {
            result.status = "fail";
            result.message = "배치 추가 실패";
            delete result.no;
        }
    });

    return function batchInsertContacts(_x5) {
        return _ref5.apply(this, arguments);
    };
})();

const updateContact = exports.updateContact = (() => {
    var _ref6 = _asyncToGenerator(function* ({ no, name, tel, address }) {
        if (typeof no === "undefined") {
            return { status: "fail", message: "no 필드는 반드시 전달해야 합니다." };
        }
        let doc = yield _testdb.Contact.updateOne({ _id: no }, { name, tel, address });
        if (doc.ok === 1 && doc.n === 1) {
            return { status: "success", message: "업데이트 성공", no: no };
        } else {
            return { status: "fail", message: "업데이트 실패" };
        }
    });

    return function updateContact(_x6) {
        return _ref6.apply(this, arguments);
    };
})();

const deleteContact = exports.deleteContact = (() => {
    var _ref7 = _asyncToGenerator(function* ({ no }) {
        if (typeof no === "undefined") {
            return { status: "fail", message: "no 필드는 반드시 전달해야 합니다." };
        }
        let delDoc = yield contactOne({ no: no, baseUrl: "" });
        if (delDoc.photo !== _constant2.default.PHOTO_URL + "noimage") {
            let photo_id = delDoc.photo.substr(_constant2.default.PHOTO_URL.length);
            yield _testdb.Photo.deleteOne({ _id: photo_id });
        }
        let doc = yield _testdb.Contact.deleteOne({ _id: no });
        if (doc.ok === 1 && doc.n === 1) {
            return { status: "success", message: "삭제 성공", no: no };
        } else {
            return { status: "fail", message: "삭제 실패" };
        }
    });

    return function deleteContact(_x7) {
        return _ref7.apply(this, arguments);
    };
})();

const streamToBuffer = (() => {
    var _ref8 = _asyncToGenerator(function* (stream) {
        return new Promise(function (resolve, reject) {
            let buffers = [];
            stream.on('error', reject);
            stream.on('data', function (data) {
                return buffers.push(data);
            });
            stream.on('end', function () {
                return resolve(Buffer.concat(buffers));
            });
        });
    });

    return function streamToBuffer(_x8) {
        return _ref8.apply(this, arguments);
    };
})();

const getPhotoImage = exports.getPhotoImage = (() => {
    var _ref9 = _asyncToGenerator(function* ({ no }) {
        let doc = yield _testdb.Photo.findOne({ _id: no });
        if (doc) {
            return doc;
        } else {
            return null;
        }
    });

    return function getPhotoImage(_x9) {
        return _ref9.apply(this, arguments);
    };
})();

const storeImageToDB = (() => {
    var _ref10 = _asyncToGenerator(function* ({ buf, mimetype }) {
        let photo = new _testdb.Photo();
        photo._id = _shortid2.default.generate();
        photo.image = buf;
        photo.mimetype = mimetype;
        yield photo.save();
        return photo._id;
    });

    return function storeImageToDB(_x10) {
        return _ref10.apply(this, arguments);
    };
})();

const changePhoto = exports.changePhoto = (() => {
    var _ref11 = _asyncToGenerator(function* ({ no, buf, mimetype }) {
        if (!mimetype.startsWith("image/")) {
            return { status: "fail", message: "이미지만 업로드 가능합니다." };
        }
        //기존 이미지 삭제(noimage가 아닐 경우만)
        let doc = yield contactOne({ no: no, baseUrl: "" });
        console.log(doc.photo);
        console.log(_constant2.default.PHOTO_URL + "noimage");
        if (doc.photo !== _constant2.default.PHOTO_URL + "noimage") {
            let photo_id = doc.photo.substr(_constant2.default.PHOTO_URL.length);
            yield _testdb.Photo.deleteOne({ _id: photo_id });
        }
        const photo_id = yield storeImageToDB({ buf, mimetype });

        let updatedDoc = yield _testdb.Contact.updateOne({ _id: no }, { photo: photo_id });
        if (updatedDoc.ok === 1 && updatedDoc.n === 1) {
            return { status: "success", message: `사진 변경 성공 => photo_id : ${photo_id}`, no: no };
        } else {
            return { status: "fail", message: "사진 변경 실패" };
        }
    });

    return function changePhoto(_x11) {
        return _ref11.apply(this, arguments);
    };
})();
//# sourceMappingURL=index.js.map
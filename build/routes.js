'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _sleepPromise = require('sleep-promise');

var _sleepPromise2 = _interopRequireDefault(_sleepPromise);

var _db = require('./db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

String.prototype.hashCode = function () {
    var hash = 0,
        i,
        chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
};

const getBaseUrl = req => {
    if (req.hostname === "localhost" || req.hostname === "127.0.0.1") return req.protocol + "://" + req.hostname;else return "https://" + req.hostname;
};
const upload = (0, _multer2.default)({ storage: _multer2.default.memoryStorage() });

exports.default = app => {

    app.post('/contacts/:no/photo', upload.single('photo'), (() => {
        var _ref = _asyncToGenerator(function* (req, res) {
            console.log("### POST /contacts/:no/photo");
            const { mimetype, buffer } = req.file;
            let doc = yield (0, _db.changePhoto)({ no: req.params.no, buf: buffer, mimetype });
            res.json(doc);
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })());

    app.get('/', (req, res) => {
        console.log("### GET /");
        res.render('index', {
            title: '연락처서비스 v2.0',
            subtitle: '(node.js + express + mongodb)'
        });
    });

    app.get('/contacts', (() => {
        var _ref2 = _asyncToGenerator(function* (req, res) {
            console.log("### GET /contacts");
            const baseUrl = getBaseUrl(req);
            let pageno = parseInt(req.query.pageno);
            let pagesize = parseInt(req.query.pagesize);
            if (isNaN(pageno)) pageno = 0;
            if (isNaN(pagesize)) pagesize = 5;
            if (pageno == 0) pagesize = 0;

            const contactlist = yield (0, _db.contactsAll)({ pageno: pageno, pagesize: pagesize, baseUrl: baseUrl });
            res.jsonp(contactlist);
        });

        return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    })());

    app.get('/contacts_long', (() => {
        var _ref3 = _asyncToGenerator(function* (req, res) {
            console.log("### GET /contacts_long");
            yield (0, _sleepPromise2.default)(1000);
            const baseUrl = getBaseUrl(req);
            let pageno = parseInt(req.query.pageno);
            let pagesize = parseInt(req.query.pagesize);
            if (isNaN(pageno)) pageno = 0;
            if (isNaN(pagesize)) pagesize = 5;
            if (pageno == 0) pagesize = 0;

            const contactlist = yield (0, _db.contactsAll)({ pageno: pageno, pagesize: pagesize, baseUrl: baseUrl });
            res.jsonp(contactlist);
        });

        return function (_x5, _x6) {
            return _ref3.apply(this, arguments);
        };
    })());

    app.get('/contacts/:no', (() => {
        var _ref4 = _asyncToGenerator(function* (req, res) {
            console.log("### GET /contacts/:no");
            const baseUrl = getBaseUrl(req);
            const no = req.params.no;
            const contact = yield (0, _db.contactOne)({ no: no, baseUrl });
            if (contact.toObject) res.jsonp(contact.toObject());else res.jsonp(contact);
        });

        return function (_x7, _x8) {
            return _ref4.apply(this, arguments);
        };
    })());

    app.get('/contacts/search/:name', (() => {
        var _ref5 = _asyncToGenerator(function* (req, res, next) {
            const name = req.params.name;
            if (typeof name !== "string" || name.length < 2) {
                var err = new Error("두글자 이상의 이름을 입력하세요");
                err.status = 400;
                next(err);
            }
            console.log("### GET /contacts/search/:name");
            const baseUrl = getBaseUrl(req);
            const contacts = yield (0, _db.searchContact)({ name, baseUrl });
            res.jsonp(contacts);
        });

        return function (_x9, _x10, _x11) {
            return _ref5.apply(this, arguments);
        };
    })());

    app.get('/contacts_long/search/:name', (() => {
        var _ref6 = _asyncToGenerator(function* (req, res, next) {
            const name = req.params.name;
            if (typeof name !== "string" || name.length < 2) {
                var err = new Error("두글자 이상의 이름을 입력하세요");
                err.status = 400;
                next(err);
            }
            console.log("### GET /contacts/search/:name");
            yield (0, _sleepPromise2.default)(1000);
            const baseUrl = getBaseUrl(req);
            const contacts = yield (0, _db.searchContact)({ name, baseUrl });
            res.jsonp(contacts);
        });

        return function (_x12, _x13, _x14) {
            return _ref6.apply(this, arguments);
        };
    })());

    app.post('/contacts', (() => {
        var _ref7 = _asyncToGenerator(function* (req, res) {
            console.log("### POST /contacts");
            let name = req.body.name;
            let tel = req.body.tel;
            let address = req.body.address;

            const doc = yield (0, _db.insertContact)({ name, tel, address });
            res.jsonp(doc);
        });

        return function (_x15, _x16) {
            return _ref7.apply(this, arguments);
        };
    })());

    app.put('/contacts/:no', (() => {
        var _ref8 = _asyncToGenerator(function* (req, res) {
            console.log("### PUT /contacts/:no");
            var no = req.params.no;
            var name = req.body.name;
            var tel = req.body.tel;
            var address = req.body.address;

            const doc = yield (0, _db.updateContact)({ no, name, tel, address });
            res.jsonp(doc);
        });

        return function (_x17, _x18) {
            return _ref8.apply(this, arguments);
        };
    })());

    app.delete('/contacts/:no', (() => {
        var _ref9 = _asyncToGenerator(function* (req, res) {
            console.log("### DELETE /contacts/:no");
            var no = req.params.no;
            const doc = yield (0, _db.deleteContact)({ no });
            res.jsonp(doc);
        });

        return function (_x19, _x20) {
            return _ref9.apply(this, arguments);
        };
    })());

    app.post('/contacts/batchinsert', (() => {
        var _ref10 = _asyncToGenerator(function* (req, res) {
            console.log("### POST /contacts/batchinsert");
            let contacts = req.body;
            const doc = yield (0, _db.batchInsertContacts)({ contacts: contacts });
            res.jsonp(doc);
        });

        return function (_x21, _x22) {
            return _ref10.apply(this, arguments);
        };
    })());

    app.get('/photos/:no', (() => {
        var _ref11 = _asyncToGenerator(function* (req, res) {
            let doc = yield (0, _db.getPhotoImage)({ no: req.params.no });
            if (doc) {
                res.setHeader('Content-Type', doc.mimetype);
                res.end(doc.image);
            } else {
                res.status(404);
                res.end();
            }
        });

        return function (_x23, _x24) {
            return _ref11.apply(this, arguments);
        };
    })());

    //----에러 처리 시작
    app.get('*', (req, res, next) => {
        var err = new Error();
        err.status = 404;
        next(err);
    });

    app.use((err, req, res, next) => {
        console.log("### ERROR!!");
        if (err.status === 404) {
            res.status(404).jsonp({ status: 404, message: "잘못된 URI 요청" });
        } else if (err.status === 500) {
            res.status(500).jsonp({ status: 500, message: "내부 서버 오류" });
        } else {
            res.status(err.status).jsonp({ status: "fail", message: err.message });
        }
    });
};
//# sourceMappingURL=routes.js.map
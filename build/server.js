'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _rotatingFileStream = require('rotating-file-stream');

var _rotatingFileStream2 = _interopRequireDefault(_rotatingFileStream);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express2.default)();

app.use((0, _cors2.default)());
app.enable("jsonp callback"); //jsonp 지원

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

//-- 로깅
var baseDir = _path2.default.resolve('.');

const logDirectory = _path2.default.join(baseDir, '/log');
_fs2.default.existsSync(logDirectory) || _fs2.default.mkdirSync(logDirectory);
var accessLogStream = (0, _rotatingFileStream2.default)('access.log', {
    interval: '1d', // 매일 매일 로그 파일 생성
    path: logDirectory
});
app.use((0, _cors2.default)('combined', { stream: accessLogStream }));

app.set('port', process.env.PORT || 3000);

app.use(_express2.default.static(baseDir + '/public'));
console.log(baseDir + '/views');
app.set('views', baseDir + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({
    extended: true
}));
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

(0, _routes2.default)(app);

const server = app.listen(app.get('port'), function () {
    console.log("연락처 서비스가 " + app.get('port') + "번 포트에서 시작되었습니다!");
});
//# sourceMappingURL=server.js.map
const imagePath = "public/photos/";
import multer from 'multer';
import sleep from 'system-sleep';
import { changePhoto, contactsAll, contactOne, searchContact, insertContact, updateContact, deleteContact } from './db';


String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

const getBaseUrl = (req) => req.protocol + "://" + req.get('host')

// var storage = multer.diskStorage({
//     destination : function(req, file, callback) {
//         console.log("##DEST");
//         callback(null, imagePath);
//     }, 
//     filename : function(req,file,callback) {
//         console.log(file);
//         var f = file.originalname.split('.')[0];
//         var ext = file.originalname.split('.')[1];
//          var newFileName = req.params.no + '_' + (new Date()).toTimeString().hashCode()  + '.' + ext;
//         req.newFileName = newFileName;
//         console.log(newFileName);
//         callback(null, newFileName);
//     }
// })
const storage = multer.memoryStorage()
const upload = multer({ storage:storage }).single('photo');


export default (app) => { 
    app.get('/', (req, res) => {
        console.log("### GET /");
        res.render('index', {
             title: '연락처서비스 v2.0',
             subtitle : '(node.js + express + mongodb)'
        })
    });

    app.get('/contacts', async (req, res) => {
        console.log("### GET /contacts");
        const baseUrl = getBaseUrl(req);
        let pageno = parseInt(req.query.pageno);
        let pagesize = parseInt(req.query.pagesize);
        if (isNaN(pageno)) pageno=0;
        if (isNaN(pagesize)) pagesize=5;
        if (pageno==0)  pagesize = 0;
        console.log(pageno, pagesize, baseUrl);
        const contactlist = await contactsAll({ pageno:pageno, pagesize:pagesize, baseUrl:baseUrl })
        res.jsonp(contactlist);
    });

    app.get('/contacts_long', async (req, res) => {
        console.log("### GET /contacts_long");
        sleep(1000);
        const baseUrl = getBaseUrl(req);
        let pageno = parseInt(req.query.pageno);
        let pagesize = parseInt(req.query.pagesize);
        if (isNaN(pageno)) pageno=0;
        if (isNaN(pagesize)) pagesize=5;
        if (pageno==0)  pagesize = 0;
        console.log(pageno, pagesize, baseUrl);
        const contactlist = await contactsAll({ pageno:pageno, pagesize:pagesize, baseUrl:baseUrl })
        res.jsonp(contactlist.toObject());
    });

    app.get('/contacts/:no', async (req,res) => {
        console.log("### GET /contacts/:no");
        const baseUrl = getBaseUrl(req);
        var no = req.params.no;
        const contact = await contactOne({ _id:no, baseUrl });
        res.jsonp(contact.toObject());
    });

    //----에러 처리 시작
    app.get('*', (req, res, next) => {
        var err = new Error();
        err.status = 404;
        next(err);
    });
    
    app.use((err, req, res, next) => {
        if(err.status === 404) {
            res.json({ status:404, message:"잘못된 URI 요청"});
        } else if (err.status === 500) {
            res.json({ status:500, message:"내부 서버 오류"});
        } else {
            return next();
        }
    });

    
}


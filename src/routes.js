import multer from 'multer';
import sleep from 'system-sleep';
import { changePhoto, getPhotoImage, batchInsertContacts, contactsAll, contactOne, searchContact, insertContact, updateContact, deleteContact } from './db';


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
const upload = multer({ storage : multer.memoryStorage()});

export default (app) => { 

    app.post('/contacts/:no/photo', upload.single('photo'), async (req, res) => {
        console.log("### POST /contacts/:no/photo");
        const { mimetype, buffer } = req.file;
        let doc = await changePhoto({ no:req.params.no, buf:buffer, mimetype })
        res.json(doc);
    });

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

        const contactlist = await contactsAll({ pageno:pageno, pagesize:pagesize, baseUrl:baseUrl })
        res.jsonp(contactlist);
    });

    app.get('/contacts/:no', async (req,res) => {
        console.log("### GET /contacts/:no");
        const baseUrl = getBaseUrl(req);
        const no = req.params.no;
        const contact = await contactOne({ no:no, baseUrl });
        if (contact.toObject)
            res.jsonp(contact.toObject());
        else 
            res.jsonp(contact)
    });

    app.get('/contacts/search/:name', async (req,res,next) => {
        const name = req.params.name;
        if (typeof(name) !== "string" || name.length < 2) {
            var err = new Error("두글자 이상의 이름을 입력하세요");
            err.status = 400;
            next(err);
        }
        console.log("### GET /contacts/search/:name")
        const baseUrl = getBaseUrl(req);
        const contacts = await searchContact({ name, baseUrl })
        res.jsonp(contacts);
    });

    app.get('/contacts_long/search/:name', async (req,res, next) => {
        const name = req.params.name;
        if (typeof(name) !== "string" || name.length < 2) {
            var err = new Error("두글자 이상의 이름을 입력하세요");
            err.status = 400;
            next(err);
        }
        sleep(1000);
        console.log("### GET /contacts/search/:name")
        const baseUrl = getBaseUrl(req);
        const contacts = await searchContact({ name, baseUrl })
        res.jsonp(contacts);
    });

    app.post('/contacts', async (req,res) => {
        console.log("### POST /contacts");
        let name = req.body.name;
        let tel = req.body.tel;
        let address = req.body.address;

        const doc = await insertContact({ name, tel, address })
        res.jsonp(doc);
    });

    app.put('/contacts/:no', async (req,res) => {
        console.log("### PUT /contacts/:no");
        var no = req.params.no;
        var name = req.body.name;
        var tel = req.body.tel;
        var address = req.body.address;

        const doc = await updateContact({ no, name, tel, address });
        res.jsonp(doc);
    });

    app.delete('/contacts/:no', async (req,res) => {
        console.log("### DELETE /contacts/:no");
        var no = req.params.no
        const doc = await deleteContact({ no })
        res.jsonp(doc);
    });

    app.post('/contacts/batchinsert', async (req,res) => {
        console.log("### POST /contacts/batchinsert");
        let contacts = req.body;
        const doc = await batchInsertContacts({ contacts: contacts })
        res.jsonp(doc);
    });

    app.get('/photos/:no', async (req,res, )=> {
        let doc = await getPhotoImage({ no: req.params.no });
        if (doc) {
          res.setHeader('Content-Type', doc.mimetype);
          res.end(doc.image);
        } else {
          res.status(404);
          res.end();
        }
    })

    //----에러 처리 시작
    app.get('*', (req, res, next) => {
        var err = new Error();
        err.status = 404;
        next(err);
    });
 
    app.use((err, req, res, next) => {
        console.log("### ERROR!!")
        if(err.status === 404) {
            res.status(404).jsonp({ status:404, message:"잘못된 URI 요청"});
        } else if (err.status === 500) {
            res.status(500).jsonp({ status:500, message:"내부 서버 오류"});
        } else {
            res.status(err.status).jsonp({ status:"fail", message:err.message });
        }
    });
}


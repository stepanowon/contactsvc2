import { ObjectId } from 'mongodb'
import { Contact, Photo, mongoose } from './testdb';
import constant from '../constant';
import shortid from 'shortid';

export const contactOne = async ({ no, baseUrl }) => {
    if (typeof(no) !== "string" && no == "") no = "not passed";
    let doc = await Contact.findById(no);
    if (doc) { 
        doc.photo = baseUrl + constant.PHOTO_URL + doc.photo;
        return doc; 
    }
    return { status:"fail", message:"연락처 정보 없음"  };
}

export const contactsAll = async ({ pageno, pagesize, baseUrl }) => {
    if (typeof(pageno) !== "number" || pageno < 0) pageno = 0;
    if (typeof(pagesize) !== "number") pagesize = 5;
    let contacts;
    if (pageno === 0) {
        pagesize=0;
        contacts = await Contact.find().sort({ _id: -1 });
    } else {
        contacts = await Contact.find().sort({ _id: -1 }).skip((pageno-1)*pagesize).limit(pagesize);
    }
    contacts = contacts.map((c,index)=> {
        let { _id, name, tel, address, photo } = c;
        return { no:_id, name, tel, address, photo: baseUrl + constant.PHOTO_URL + photo }
    })
    let count = await Contact.countDocuments();
    return { pageno, pagesize, totalcount:count, contacts };
}

export const searchContact = async({ name, baseUrl }) => {
    let contacts = await Contact.find({ name: new RegExp(name, "i")}).sort({name:1});
    contacts = contacts.map((c,index)=> {
        let { _id, name, tel, address, photo } = c;
        return { no:_id, name, tel, address, photo: baseUrl + constant.PHOTO_URL + photo }
    })
    return contacts;
}

export const insertContact = async ({ name, tel, address, photo }) => {
    if (typeof(photo) === "undefined" || photo == null) {
        photo = 'noimage';
    }
    let _id = new ObjectId().toHexString();
    let c1 = new Contact({
        _id, name, tel, address, photo
    })
    let doc = await c1.save()
    if (doc)
        return { status: "success", message:"연락처 추가 성공", no: doc._id };
    else
        return { status: "fail", message:"연락처 추가 실패" };
} 

export const batchInsertContacts = async({ contacts }) => {
    const result  = { status : "", message: "", no : [] };
    let count = 0;
    try {
        for (let i=0; i < contacts.length; i++) {
            let { name, tel, address } = contacts[i];
            let doc = await insertContact({ name, tel, address });
            if (doc.status === "ok") {
                result.no.push(doc.no);
                count++;
            }
        }
        result.status = "success";
        result.message = count + "건의 데이터 추가 성공";
        return result;
    } catch(e) {
        result.status = "fail";
        result.message = "배치 추가 실패";
        delete result.no;
    }
}

export const updateContact = async ({ no, name, tel, address }) => {
    if (typeof(no) === "undefined") {
        return { status: "fail", message:"no 필드는 반드시 전달해야 합니다." };
    }
    let doc = await Contact.updateOne({ _id: no }, { name, tel, address })
    if (doc.ok === 1 && doc.n === 1) {
        return { status:"success", message:"업데이트 성공", no:no };
    } else {
        return { status:"fail", message:"업데이트 실패" };
    }
}

export const deleteContact = async ({ no }) => {
    if (typeof(no) === "undefined") {
        return { status: "fail", message:"no 필드는 반드시 전달해야 합니다." };
    }
    let delDoc = await contactOne({ no:no, baseUrl: "" });
    if (delDoc.photo !== constant.PHOTO_URL + "noimage") {
        let photo_id = delDoc.photo.substr(constant.PHOTO_URL.length);
        await Photo.deleteOne({ _id: photo_id });
    }
    let doc = await Contact.deleteOne({ _id:no });
    if (doc.ok === 1 && doc.n === 1) {
        return { status:"success", message:"삭제 성공", no:no };
    } else {
        return { status:"fail", message:"삭제 실패" };
    }
}

const streamToBuffer = async (stream) => {  
    return new Promise((resolve, reject) => {
        let buffers = [];
        stream.on('error', reject);
        stream.on('data', (data) => buffers.push(data));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
}  

export const getPhotoImage = async ({ no }) => {
    let doc = await Photo.findOne({ _id: no });
    if (doc) {
        return doc;
    } else {
        return null;
    }
}

const storeImageToDB = async ({buf, mimetype}) => {
    let photo = new Photo();
    photo._id = shortid.generate();
    photo.image = buf;
    photo.mimetype = mimetype;
    await photo.save();
    return photo._id;
}


export const changePhoto = async ({no, buf, mimetype})=> {
    if (!mimetype.startsWith("image/")) {
        return { status:"fail", message:"이미지만 업로드 가능합니다." };
    }
    //기존 이미지 삭제(noimage가 아닐 경우만)
    let doc = await contactOne({ no:no, baseUrl: "" });
    console.log(doc.photo)
    console.log(constant.PHOTO_URL + "noimage")
    if (doc.photo !== constant.PHOTO_URL + "noimage") {
        let photo_id = doc.photo.substr(constant.PHOTO_URL.length);
        await Photo.deleteOne({ _id: photo_id });
    }
    const photo_id = await storeImageToDB({ buf, mimetype })

    let updatedDoc = await Contact.updateOne({ _id: no }, { photo: photo_id })
    if (updatedDoc.ok === 1 && updatedDoc.n === 1) {
        return { status:"success", message: `사진 변경 성공 => photo_id : ${photo_id}`, no:no };
    } else {
        return { status:"fail", message:"사진 변경 실패" };
    }
}
import { Contact, Photo, mongoose } from '../db/testdb';
import fs from 'fs';
import shortid from 'shortid';
import { ObjectId } from 'mongodb'

const imageFilePath = "temp_photow/";

let firstNames= "Kel,Morgan,Amari,Akiyama,Quan,Ariana,Rana,Carrie,London,Shelley,Hailey,Stella,Aki,Sun,Leigh,Maya,Jermyn,Kim,Lauren,Koryne,Fanny,Maima,Nahid,Khalea,Rachel,Maired,Sa,Serin,Blake,Drew,Lina,Priyal,Megan,Bailey,Amaya,Kaelyn,Charlotte,Korra,Kassie,Keeta,Mallie,Noel,Tracy,Kace,Killion,Kenyatta,Pita,Raye,Sadie,Evon,Addison,Arrietty,Engel,Feron,Courtney,Tonya,Landon,Mila,Nade,Gladys,Sean,Rhu,Rosebud,Sophie,Zari,Rose,Jain,Harper,Lai,Kelley,Lyanne,Le,Nivea,Penelope,Remy,Sophia,Ray,Rai,Amoni,Zoe,Kylie,Zenon,Alania,Aveen,Annabelle,Caroline,Emani,Catera,Lin,Francess,Isabella,Victoria,Isabelle,Ambrosia,Jennifer,Jesse,Kalisa,Katchi,Katherine,Keandra"
let arrfNames = firstNames.split(',');
let lastNames = "Anderson,Allen,Adams,Brown,Baker,Bailey,Bell,Brooks,Bennett,Butler,Barnes,Clark,Campbell,Carter,Collins,Cook,Cooper,Cox,Cruz,Davis,Díaz,Evans,Edwards,Flores,Foster,Fisher,Harris,Hall,Hill,Howard,Hughes,Johnson,Jones,Jackson,James,Jenkins,Gray,King,Miller,Martinez,Moore,Martin,Mitchell,Morris,Murphy,Morgan,Myers,Morales,Nelson,Nguyen,Ortiz,Lee,Lewis,Long,Phillips,Parker,Peterson,Price,Powell,Perry,Robinson,Ramirez,Roberts,Rivera,Rogers,Reed,Richardson,Reyes,Ross,Russell,Smith,Scott,Stewart,Sanders,Sullivan,Taylor,Thomas,Thompson,Turner,Torres,Williams,Wilson,White,Walker,Wright,Ward,Wood,Watso,Young";
let arrlNames = lastNames.split(',');

const initialize = async () => {
    //기존 데이터 삭제
    await Contact.deleteMany()
    await Photo.deleteMany()
    //사진 없음일 때 사용할 레고이미지 추가
    let noimage_photo = new Photo();
    noimage_photo._id = "noimage";
    noimage_photo.image = fs.readFileSync(imageFilePath + "noimage.jpg");
    noimage_photo.mimetype = "image/jpeg";
    await noimage_photo.save();

    for (let i=1; i <= 100; i++) {
        //사진 저장 후 연락처 저장
        let photo = new Photo();
        photo._id = shortid.generate();
        photo.image = fs.readFileSync(imageFilePath + i + ".jpg");
        photo.mimetype = "image/jpeg";
        await photo.save();

        let num=""+i;
        if (i < 10) num = "0"+i;
        let ridx = Math.floor(Math.random() * arrlNames.length);
        let name = arrfNames[i-1] + " " + arrlNames[ridx]
        let tel = "010-3456-82"+num;
        let address="서울시";
        let _id = new ObjectId().toHexString();
        let c1 = new Contact({ _id, name, tel, address, photo:photo._id });
        await c1.save();
    }
    mongoose.connection.close();
    console.log("Connection Close!!")
}

// const initialize = async () => {
//     await removeCollection();
//     await del(['public/photos/*']);
//     await cpFile(`temp_photow/noimage.jpg`, `${constant.SAVE_PHOTO_DIR}/noimage.jpg`);
//     for (let i=1; i <= 100; i++) {
//         await cpFile(`temp_photow/${i}.jpg`, `${constant.SAVE_PHOTO_DIR}/${i}.jpg`);
//         let photo = `${constant.PHOTO_URL}/${i}.jpg`;
//         let num=""+i;
//         if (i < 10) num = "0"+i;
//         let ridx = Math.floor(Math.random() * arrlNames.length);
//         let name = arrfNames[i-1] + " " + arrlNames[ridx]
//         let tel = "010-3456-82"+num;
//         let address="서울시";
//         let doc = await insertContact({ name, tel, address, photo })
//     }
//     closeConnection();
// }

initialize();
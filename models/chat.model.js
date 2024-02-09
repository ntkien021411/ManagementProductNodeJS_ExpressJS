const mongoose = require('mongoose');

//Tạo model
const chatSchema = new mongoose.Schema({
    user_id:String,
    room_chat_id: String,
    content : String,
    images: Array,
    deleted:{
        type:Boolean,
        default:false
    },
    deletedAt :Date,
},{
    timestamps : true
});
//Tham số 1 là tên model
//Tham số 2 schema : cấu trúc của dữ liệu để thêm vào db
//Tham số 3 là tên collection(tên table)
const Chat = mongoose.model('Chat', chatSchema,"chats");
module.exports = Chat;

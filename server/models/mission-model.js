const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mission_schema = new Schema({
    topic_level2: String,
    words: [String],
    user1_id: String,
    user2_id: String,
    match_id:String
},{timestamps:true});

const Mission = mongoose.model('Mission', mission_schema);
module.exports = Mission;
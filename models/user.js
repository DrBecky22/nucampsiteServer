const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    facebookId: String,
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,   //if this is not present from the beginning, all previous users will have null values for this field and it can prevent authentication
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
//collection automatically called users, and schema set to userSchema - it is a weird naming convention in Express that capitalized singular gets converted to lowercase plural
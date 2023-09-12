const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a username'],
        minLength: 3
    },
    email:{
        type: String,
        required: [true,'please provide a email address'],
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email address')
            }
        }
    },
    password:{
        type: String,
        minLength:8,
        select:false,
        required: [true, 'please provide a valid password']
    }
});
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};
 const User = mongoose.model("User",userSchema);
 module.exports = User;
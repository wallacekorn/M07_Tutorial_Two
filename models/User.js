const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6,'Minimum password length is 6 characters']
    },
});

// // fire a function after doc saved to db
// userSchema.post('save', function(doc, next){
//     console.log('new user was created and saved', doc);
//     next();
// });

// fire a function before doc saved to db
userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(); // generates a salt and stores it
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email }); // 'this' is the user model
    if (user) { // user was found
      const auth = await bcrypt.compare(password, user.password); // compare the entered password(hashed) and the found users password(hashed)
      if (auth) { // password was found
        return user; // verified, return user
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
  };

const User = mongoose.model('user', userSchema); // 'user' must be singular verson of collection

module.exports = User;
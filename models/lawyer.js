const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const LawyerSchema = new Schema({
  email: { type: String, unique: true },
  name: String,
  password: String,
  picture: String,
  mobile:String,
  country:String,
  city:String,
  
  experience:String,
  j_practice_location:String,
  biography:String,
  practice_areas:[{type:String}],
  languages:[{type:String}],
  education:[{type:String}],
  p_associations:[{type:String}],

  address: {
    addr1: String,
    addr2: String,
    state: String,
    postalCode: String
  },
  created: { type: Date, default: Date.now },
});


LawyerSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();
  
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);
    
    user.password = hash;
    next();
  });
});

LawyerSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

LawyerSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  } else {
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro'; 
  }
}

module.exports = mongoose.model('Lawyer', LawyerSchema);
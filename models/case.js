const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;

const CaseSchema = new Schema({
  User: { type: String, ref: 'User',field: 'email'},
  dispositioncode:String,
  dispositiondate:String,
  sentencetime:String,
  description:String,
  amendedcharge:String,
  
  typeofcase:String,
  costoffordable:Number,
  probationtime:String,
  drivingrestrictions:String,
  jail_penitentiary:String,
  
  lawyerRequests:[{type:String,ref:'Lawyer',field: 'email'}],
  userRequests:[{type:String,ref:'Lawyer',field: 'email'}],
  locked:{type:Boolean,default:false},
  lockedlawyer:{type:String,ref:'Lawyer',field: 'email'},
  created: { type: Date, default: Date.now }
});

// CaseSchema.plugin(deepPopulate);

module.exports = mongoose.model('Case', CaseSchema);

const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;

const CaseSchema = new Schema({
  User: { type: Schema.Types.ObjectId, ref: 'User'},
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
  lawyerRequests:[{type:Schema.Types.ObjectId,ref:'Lawyer'}],
  userRequests:[{type:Schema.Types.ObjectId,ref:'Lawyer'}],
  locked:{type:Boolean,default:false},
  lockedlawyer:{type:Schema.Types.ObjectId,ref:'Lawyer'},
  created: { type: Date, default: Date.now }
});

// CaseSchema.plugin(deepPopulate);

module.exports = mongoose.model('Case', CaseSchema);

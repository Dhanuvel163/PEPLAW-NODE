const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;

const CaseSchema = new Schema({
  virtualUser: { type: String},
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

  virtuallawyerRequests:[{type:String}],
  virtualuserRequests:[{type:String}],
  virtuallockedlawyer:{type:String},
  locked:{type:Boolean,default:false},
  created: { type: Date, default: Date.now }
},{
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

CaseSchema.virtual('User', {
  ref: 'User', // The model to use
  localField: 'virtualUser', // Find people where `localField`
  foreignField: 'email', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  // justOne: false,
  // options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});
CaseSchema.virtual('lawyerRequests', {
  ref: 'Lawyer',
  localField: 'virtuallawyerRequests',
  foreignField: 'email',
});
CaseSchema.virtual('userRequests', {
  ref: 'Lawyer',
  localField: 'virtualuserRequests',
  foreignField: 'email',
});
CaseSchema.virtual('lockedlawyer', {
  ref: 'Lawyer',
  localField: 'virtuallockedlawyer',
  foreignField: 'email',
});
// CaseSchema.plugin(deepPopulate);

module.exports = mongoose.model('Case', CaseSchema);

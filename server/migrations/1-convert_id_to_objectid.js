var ObjectID = require('mongodb').ObjectID;

module.exports.id = "CONVERT_ID_TO_OBJECTID";

module.exports.up = function (done) {
  var log = this.log;

  var res_col = this.db.collection("resources");
  
  res_col
      .find({"_id": {"$type": "string"}}).toArray()
      .then(function(docs) {
        if (docs.length == 0) return Promise.resolve();
        log("Convert the ID of " + docs.length + " documents into ObjectId");
        return res_col.insertMany(docs.map(function(doc) {
          doc._id = new ObjectID(doc._id);
          return doc;
        }))
      })
      .then(function() {
        return res_col.remove({"_id": {"$type": "string"}});
      })
      .then(function() { done(); })
      .catch(function (err) {
        log(err);
        log(err.stack);
        done("err");
      });
};
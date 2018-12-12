module.exports.id = "MOVE_MIMETYPE_TO_RESOURCE";

module.exports.up = function (done) {
  var log = this.log;

  var res_col = this.db.collection("resources");

  log("Rename file.mimetype to mimetype");
  res_col
      .updateMany({}, {$rename: { "file.mimetype": "mimetype" }})
      .then(function() { done(); })
      .catch(function (err) {
        log(err);
        log(err.stack);
        done("err");
      });
};
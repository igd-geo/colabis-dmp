exports.id = "SEPARATE_DOWNLOAD_HISTORY";

/**
 * Don't create a new version for each download but store the
 * download history in a separate collection.
 * @param done
 */
exports.up = function (done) {
  var log = this.log;

  var res_col = this.db.collection("resources");
  var his_col = this.db.collection("download_history");

  /**
   * Find all versions which are related to a change in download count
   * @returns {Promise}
   */
  var findDownloadCountVersions = function() {
    return res_col.group(
        ["id", "file.download_count"], // keys
        {"file.download_count": {"$gt": 0}}, // condition
        {}, // initial
        function (cur, res) {  // reduce
          if (res.version === undefined || cur.version < res.version) {
            res.version = cur.version;
            res.updated = cur.updated;
          }
        },
        true // default command param is not considered as callback)
    );
  };

  /**
   * Create download history entries based on the resource entries (i.e. versions)
   * which were created only for the purpose of increasing the download count.
   * The resulting promise will provide the list of resource entries which have been
   * used to create the history entries.
   * @returns {Promise} List of documents containing id and version of resource entries
   */
  var createDownloadHistory = function() {
    return findDownloadCountVersions()
        .then(function(docs) {
          log("Insert " + docs.length + " download history entries");
          return Promise.all(
            docs.map(function(doc) {
              return his_col.insertOne({
                resource_id: doc.id,
                version: doc.version,
                datetime: doc.updated
              }).then(function() {
                return doc;
              });
            })
          );
        });
  };

  /**
   * Remove resources specified by ID and version
   * @param docs List of documents containing id and version
   * @returns {Promise}
   */
  var removeResources = function(docs) {
    log("Remove " + docs.length + " documents related to download count only");
    return Promise.all(
        docs.map(function(doc) {
          return res_col.deleteMany({id: doc.id, version: doc.version});
        })
    );
  };

  /**
   * Remove download_count properties from all resources
   * @returns {Promise}
   */
  var removeDownloadCount = function() {
    log("Remove download count property from all resources");
    return res_col.updateMany({}, {$unset: {"file.download_count": 1}});
  };

  // find all versions only changing the download count
  createDownloadHistory()
      .then(removeResources)
      .then(removeDownloadCount)
      .then(function() {
        done()
      }).catch(function (err) {
        log(err.stack);
        done("err");
      });
};
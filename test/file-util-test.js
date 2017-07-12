var assert = require('assert');
var FileUtils = require('../file-util');

describe('File Utils', function() {
  describe('Get workspace', function() {
    it('should return workspace as tree', function(done) {
      FileUtils.getWorkspace('./workspace')
      	.then(function(result){
      		console.log(JSON.stringify(result, null, 2));
      		done();
      	})
      	.catch(function(err){
      		done();
      	});
    });
  });
});
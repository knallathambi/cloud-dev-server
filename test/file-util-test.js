var assert = require('assert');
var FileUtils = require('../file-util');

describe('File Utils', function() {
  describe('Get workspace', function() {
    it('should return workspace as tree', function(done) {
      FileUtils.getWorkspace('./user_workspace/workspace')
      	.then(function(result){
      		console.log(JSON.stringify(result, null, 2));
      		done();
      	})
      	.catch(function(err){
      		console.error(err);
      		done();
      	});
    });
  });

  describe('Create workspace', function() {
    it('should create workspace folder', function(done) {
      FileUtils.createWorkspace('./user_workspace/karthik')
      	.then(function(result){
      		done();
      	})
      	.catch(function(err){
      		console.error(err);
      		done();
      	});
    });
  });

  describe('Sync workspace', function() {
    it('should sync workspace folder', function(done) {
      var dirTree = require('../sample_workspace.json');
      FileUtils.syncWorkspace('./user_workspace/karthik1', dirTree)
      	.then(function(result){
      		console.log('Completed succesfully');
      		done();
      	})
      	.catch(function(err){
      		console.error(err);
      		done();
      	});
    });
  });

});
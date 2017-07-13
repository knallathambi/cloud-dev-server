const fs = require('fs');
const crypto = require('crypto');

var FileUtils = function(){}

FileUtils.getWorkspace = function(workspaceName){

	var dirTree = [];

	var buildFileTree = function (dirName, dirTree, callback) {
		fs.readdir(dirName, function(err, files){
			if (err){
				console.error(err);
				return callback(err);
			}
			var dirPath = fs.realpathSync(dirName);
			var listLength = files.length;
			var processCount = 0;
			if (listLength == 0){
				callback(null);
			}
			files.forEach( function(file){
				filePath = dirPath + '\\' + file;
				var stat = fs.statSync(filePath);
				var fileObj = {
					name: file,
					path: filePath,
					type: stat.isDirectory() ? 'dir': 'file',
					children: []
				};
				dirTree.push(fileObj);
				if ( stat.isDirectory() ){
					buildFileTree(filePath, fileObj.children, function(err){
						if (err){
							return callback(err);
						} 
						processCount++;					
						if (processCount == listLength){
							callback(null);
						}

					});
				} else {

					FileUtils.generateHash(fileObj)
						.then(function(result){
							processCount++;
							if (processCount == listLength){
								callback(null);
							}
						});
				}

			});
		});
	}

	return new Promise(function(resolve, reject){
		buildFileTree(workspaceName, dirTree, function(err){
			if(err){
				console.error(err);
				reject(err);
			} else {
				//console.log('Tree - '+JSON.stringify(dirTree, null, 4));
				resolve(dirTree);				
			}
		});
	});

}

FileUtils.generateHash = function(fileObj){
	const hash = crypto.createHash('sha256');
	const input = fs.createReadStream(fileObj.path);

	return new Promise(function(resolve, reject){
		input.on('readable', () => {
		  const data = input.read();
		  if (data)
		    hash.update(data);
		  else {
		  	const hashString = hash.digest('hex');
		    console.log(`${hashString} ${fileObj.name}`);
		    fileObj.hash = hashString;
		    resolve(hashString);
		  }
		});	
	});
}


module.exports = FileUtils;



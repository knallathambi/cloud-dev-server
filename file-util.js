var fs = require('fs');

var FileUtils = function(){}

FileUtils.getWorkspace = function(workspaceName){

	var dirTree = [];

	var buildFileTree = function (dirName, dirTree, callback) {
		//console.log('Read dir - '+dirName);
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
				//console.log('Stat - '+filePath);
				var stat = fs.statSync(filePath);
				var fileObj = {
					name: file,
					path: filePath,
					type: stat.isDirectory() ? 'dir': 'file',
					children: []
				};
				dirTree.push(fileObj);
				if ( stat.isDirectory() ){
					//console.log('Process dir - '+filePath);
					buildFileTree(filePath, fileObj.children, function(err){
						if (err){
							return callback(err);
						} 
						processCount++;					
						//console.log(listLength+", "+processCount);
						//callback(null);
						if (processCount == listLength){
							//console.log('dir callback');
							callback(null);
						}

					});
				} else {
					//console.log('Process file - '+filePath);
					processCount++;
					//console.log(listLength+", "+processCount);
					if (processCount == listLength){
						//console.log('file callback');
						callback(null);
					}
				}

			});
			//callback(null);
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

module.exports = FileUtils;



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
		  var content = "";
		  if (data) {
		    hash.update(data);			
		  } else {

		  	const hashString = hash.digest('hex');
		    //console.log(`${hashString} ${fileObj.name}`);
		    fileObj.hash = hashString;

		    fs.readFile(fileObj.path, 'utf-8', function(err, data){
		    	if (err){
		    		reject(err);
		    	} else {
		    		fileObj.content = {};
		    		try {
		    			fileObj.content = JSON.parse(data);
		    		} catch(e){
		    			console.error(e);
		    			fileObj.content = {
		    				error: e,
		    				source: data
		    			};
		    		}
		    		resolve(hashString);
		    	}
		    });
		    
		  }
		});	
	});
}

FileUtils.createWorkspace = function(workspaceName){
	return new Promise(function(resolve, reject){
		fs.mkdir(workspaceName, function(err){
			if (err){
				reject(err);
			} else {
				resolve();
			}
		})
	});
}

FileUtils.syncWorkspace = function(workspaceName, dirTree){

	var checkDir = function(dirPath, dirTree, callback){
		var processCount = 0;
		dirPath = fs.realpathSync(dirPath);
		for(var i=0; i< dirTree.length; i++){
			if (dirTree[i].type == 'dir'){
				var newDirPath = dirPath + '\\' + dirTree[i].name;
				if (fs.existsSync(newDirPath)){
					console.log(`Dir already exists - ${newDirPath}`);
				} else {
					fs.mkdirSync(newDirPath);
					console.log(`Dir created - ${newDirPath}`);
				}

				checkDir(newDirPath, dirTree[i].children, function(err){
					if (err){
						return callback(err);
					} else {
						processCount ++;
						if (processCount == dirTree.length){
							callback(null);
						}
					}
				});
			} else {
				var filePath = dirPath + '\\' + dirTree[i].name;
				if (fs.existsSync(filePath)){
					console.log(`File already exists - ${filePath}`);
					processCount ++;
					if (processCount == dirTree.length){
						callback(null);
					}

				} else {
					fs.writeFile(filePath, JSON.stringify(dirTree[i].content), function(err){
						if (err){
							return callback(err);
						} else {
							processCount ++;
							if (processCount == dirTree.length){
								callback(null);
							}

						}
					})
				}
			}
		}
	}

	return new Promise(function(resolve, reject){
		checkDir(workspaceName, dirTree, function(err){
			if(err){
				console.error(err);
				reject(err);
			} else {
				//console.log('Tree - '+JSON.stringify(dirTree, null, 4));
				resolve();				
			}
		});
	});


}

module.exports = FileUtils;



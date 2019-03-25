var fileData = [];
var imageType = "image";
var vm = "";
function showActionSheet() {//方式选择
    var bts = [{title: "拍照"}, {title: "从相册选择"}];
    plus.nativeUI.actionSheet(
        {
            cancel: "取消",
            buttons: bts
        },
    	function (e) {
    		fileData = [];
    	    if (e.index == 1) {
    	         getImage()
    	    } else if (e.index == 2) {
    	        galleryImgs();
    	    }
    	}
	);
}

//相册选择
function galleryImgs() {
	plus.gallery.pick(function(e){
		compressImage([e],0);
    }, function(e){
    },{filter: "image",multiple: false,system:false});//system可控制多选是否遵从系统方法
}

//拍照
function getImage() {
    var cmr = plus.camera.getCamera();
    cmr.captureImage(function (path) {
    	plus.gallery.save(path, function(){});//把图片保存到相册
        plus.io.resolveLocalFileSystemURL(path, function (entry) {
          var localurl = entry.toLocalURL(); 
          compressImage([localurl],0);
        });
    });
}
//图片压缩
function compressImage(_flies, file_index) {
    var localurl = _flies[file_index];
    plus.nativeUI.showWaiting("压缩中...");
    plus.zip.compressImage({
      src: localurl,
      dst: "./img/aa.jpg",
      overwrite: true,
      quality: 20
    },
	function (event) {
    var fileInfo = {
        "FilePath": "./img/aa.jpg",//压缩后路径
        "FileCategory": "",
    }
    fileData.push(fileInfo);
    if (file_index + 1 < _flies.length) {
        compressImage(_flies, file_index + 1);
    } else {
        uploadeImage(fileData);
    }
	},
	function (error) {
    if (file_index + 1 < _flies.length) {
        compressImage(_flies, file_index + 1);
    } else {
    	var fileInfo = {
        "FilePath": _flies[file_index],//压缩后路径
	    }
	    fileData.push(fileInfo);
        uploadeImage(fileData);
    }
	});
}
//上传图片
function uploadeImage(_fileList) {
	plus.nativeUI.closeWaiting();
  plus.nativeUI.showWaiting("上传中...");
    var task = plus.uploader.createUpload(pubilcUrl + "/file/upload-img", {
        method: "POST"
    },function (result) { //上传完成
    		plus.nativeUI.closeWaiting();
    		var resultData = JSON.parse(result.responseText);
//  		console.log("上传完成" + JSON.stringify(resultData));
		    if (result.state == "4" && result.responseText !="") {
		        clearTimeout();
		        if(resultData.status == "1") {
		        	mui.toast("上传成功");
		        	resultData.data.path = _fileList[0].FilePath;
		        	if(imageType == "image") {
		        		vm.imageData.push(resultData.data);
		        	} else if(imageType == "banner"){
		        		vm.bannerData.push(resultData.data);
		        	}
		        return;
		        } else {
		        	mui.toast("图片上传失败" + resultData.message);
		        }
	        	
		    } else {
		        mui.toast("图片上传失败");
		    }
		}
	);
  for (var i = 0; i < _fileList.length; i++) {
      task.addFile(_fileList[i].FilePath, {
          key: "uploadkey" + i
      });
  }
  task.start();
	setTimeout(function(){
        if(task.state != "4") {
            task.abort();
            mui.toast("上传超时");
            plus.nativeUI.closeWaiting();
        }
    },timeoutSet)
}




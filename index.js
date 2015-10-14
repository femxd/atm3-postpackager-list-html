module.exports = function(ret, conf, settings, opt) {
    var tpl = "<li><a href='{href}'>{title}</a></li>";
    var folders = {};
    fis.util.map(ret.src, function(subpath, file) {
        if (file.isHtmlLike) {
            if (!folders[file.subdirname]) {
                folders[file.subdirname] = {
                    files: [],
                    listFile: null
                }
            }

            var folderObj = folders[file.subdirname];
            if (file.basename === 'list.html') {
                folderObj.listFile = file;
            } else {
                folderObj.files.push(file);
            }
        }
    });
    fis.util.map(folders, function(_subdirname, folderObj) {
        var listFile = folderObj.listFile;
        if (!folderObj.listFile) {
            return false;
        }
        var body = [];
        folderObj.files.forEach(function(file) {
            var matches = file.getContent().match(/\<title\>\S*\-(\S*)<\/title>/i);
            if (!matches) {
                matches = file.getContent().match(/\<title\>(\S*)<\/title>/i)
            }
            var title = matches ? RegExp.$1 : file.basename;
            body.push(tpl.replace('{href}', file.basename).replace('{title}', title));
        });
        listFile.setContent(listFile.getContent().replace('${list}', body.join("\r\n")));
        fis.log.debug("generate list.html ok");
    });
}
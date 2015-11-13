var path = require('path'),
    listFilePath = path.join(__dirname, "./list.html"),
    content = fis.util.read(listFilePath);

module.exports = function (ret, conf, settings, opt) {
    var folders = {};
    fis.util.map(ret.src, function (subpath, file) {
        if (file.isHtmlLike) {
            var folderObj = folders[file.subdirname];
            if (!folderObj) {
                folderObj = folders[file.subdirname] = {
                    files: [],
                    listFile: null
                }
            }
            if (file.basename === 'list.html') {
                folderObj.listFile = file;
            } else {
                folderObj.files.push(file);
                folderObj.dirname = file.dirname;
            }
        }
    });
    fis.util.map(folders, function (_subdirname, folderObj) {
        if (folderObj.files.length > 1) {
            var listFile = folderObj.listFile;
            if (!listFile) {
                fis.file.wrap(folderObj.dirname + "/list.html");
                listFile.setContent(content);
                generateListFile(listFile, folderObj.files);
                fis.log.debug("generate list.html ok");
            }
        }
    });
}

function generateListFile(listFile, files) {
    var body = [],
        tpl = "<li><a href='{href}'>{title}</a></li>";

    files.forEach(function (file) {
        var matches = file.getContent().match(/\<title\>\S*\-(\S*)<\/title>/i);
        if (!matches) {
            matches = file.getContent().match(/\<title\>(\S*)<\/title>/i)
        }
        var title = matches ? RegExp.$1 : file.basename;
        body.push(tpl.replace('{href}', file.basename).replace('{title}', title));
    });
    listFile.setContent(listFile.getContent().replace('${list}', body.join("\r\n")));
}
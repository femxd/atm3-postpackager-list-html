var path = require('path'),
  listFilePath = path.join(__dirname, "./list.html"),
  content = fis.util.read(listFilePath);

module.exports = function(ret, conf, settings, opt) {
  var htmls = {};
  fis.util.map(ret.src, function(subpath, file) {
    if (!file.isHtmlLike) {
      return false;
    }

    var folder = htmls[file.subdirname];
    if (!folder) {
      htmls[file.subdirname] = [];
      folder = htmls[file.subdirname];
    }
    folder.push(file);
  });
  var rootFolder = Object.keys(htmls).sort(function(alen, blen) {
    if (alen < blen) {
      return -1;
    } else if (alen > blen) {
      return 1;
    } else {
      return 0;
    }
  })[0];
  var rootFile = htmls[rootFolder][0];
  // fis.log.debug("rootFolder: ", rootFolder);
  var listFile = fis.file.wrap(rootFile.dirname + "/list.html");
  var listBodys = Object.keys(htmls).map(function(folder) {
    return generateListBody(folder, htmls[folder], rootFolder);
  });
  listFile.setContent(content.replace('${list}', listBodys.join('\r\n')));

  // fis.log.allan("listFile: \n", listFile.getContent());
  fis.compile(listFile);
};

function generateListBody(folder, files, rootFolder) {
  var body = [],
    ulTpl = "<ul><h2>{title}</h2>",
    tpl = "<li><a href='{href}'>{title}</a></li>";

  body.push(ulTpl.replace('{title}', folder));
  files.forEach(function(file) {
    var matches = file.getContent().match(/<title>(\S*)-(\S*)<\/title>/i);
    if (!matches) {
      matches = file.getContent().match(/<title>(\S*)<\/title>/i)
    }
    var title = matches ? RegExp.$1 : file.basename;
    var href = path.relative(rootFolder, file.release);
    body.push(tpl.replace('{href}', href).replace('{title}', title));
  });
  body.push("</ul>");
  return body.join("\r\n");
}

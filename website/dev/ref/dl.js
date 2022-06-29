function dl_file_downlaod(filename, url) {
    return _dl_getBlob(url, function(blob) {
        _dl_saveAs(blob, filename);
    })
}

function _dl_getBlob(url,cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if (xhr.status === 200) {
            cb(xhr.response);
        }
    };
    xhr.send();
    return xhr
}

function _dl_saveAs(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    }
}

/* file size string */
function fileSizeStr(v) {
    let prefix = 0
    while (v>1000&&prefix<4) {
        v /= 1024
        prefix++
    }
    return`${v.toFixed(2)} ${['','K','M','G','T'][prefix]}B`
}
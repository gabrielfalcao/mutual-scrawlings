var uploadController = {
    data: {
        config: null
    },
    uiElements: {
        uploadButton: null,
        uploadProgressBar: null
    },
    init: function (configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-video-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');

        this.wireEvents();
    },
    wireEvents: function () {
        var that = this;
        this.uiElements.uploadButton.on('change', function (result) {
            var file = $('#upload').get(0).files[0];
            var requestDocumentUrl = that.data.config.apiBaseUrl + '/get_signed_url?filename='+ encodeURI(file.name);

            $.get(requestDocumentUrl, function (data, status) {
                that.upload(file, data, that)
            });

            this.value = null;
        });
    },
    upload: function (file, data, that) {
        console.log(data)

        this.uiElements.uploadButtonContainer.hide();
        this.uiElements.uploadProgressBar.show();
        this.uiElements.uploadProgressBar.find('.progress-bar').css('width', '0');

        var fd = new FormData();
        // fd.append('key', data.key)
        // fd.append('acl', 'public-read');
        // fd.append('Content-Type', file.type);
        // fd.append('AWSAccessKeyId', data.access_key);
        // fd.append('policy', data.encoded_policy)
        // fd.append('signature', data.signature);
        fd.append('file', file);//, file.name);

        $.ajaxSetup({
            'beforeSend': function (xhr) {
               console.log('nothign')
            }
        });

        $.ajax({
            url: data.url,
            type: 'PUT',
            data: fd,
            processData: false,
            contentType: file.type,
            xhr: this.progress,
            headers: {}
        }).done(function (response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
        }).fail(function (response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            alert('Failed to upload');
        });
        $.ajaxSetup({
            'beforeSend': function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
            }
        });
    },
    progress: function () {

        var xhr = $.ajaxSettings.xhr();
        xhr.upload.onprogress = function (evt) {
            var percentage = evt.loaded / evt.total * 100;
            $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
        };
        return xhr;
    }
}

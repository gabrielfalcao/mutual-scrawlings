var mediaController = {
    data: {
        config: null
    },
    uiElements: {
        uploadButton: null,
        uploadProgressBar: null,
        imageCardTemplate: null,
        imageList: null,
    },
    init: function (configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-image-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');

        this.wireEvents();

        this.uiElements.imageCardTemplate = $('#image-template');
        this.uiElements.imageList = $('#image-list');

        // this.data.config = config;
        this.fetchFromDynamoDB();
    },
    wireEvents: function () {
        this.uiElements.uploadButton.on('change', function (result) {
            let file = $('#upload').get(0).files[0];
            let requestDocumentUrl = this.data.config.apiBaseUrl + '/get_signed_url?content_type='+ encodeURI(file.type);
            let fileSizeMB = Math.round(100 * file.size / (1024 * 1024)) / 100;
            if(fileSizeMB > 1){
                alert(
                    "File cannot be greater than 1MB! The file uploaded: " + fileSizeMB
                );
                this.value = "";
            } else {

                $.get(requestDocumentUrl, function (data, status) {
                    this.upload(file, data)
                }.bind(this));

                this.value = null;
            }
        }.bind(this));
    },
    upload: function (file, data) {
        this.uiElements.uploadButtonContainer.hide();
        this.uiElements.uploadProgressBar.show();
        this.uiElements.uploadProgressBar.find('.progress-bar').css('width', '0');

        $.ajaxSetup({
            'beforeSend': function (xhr) {
            }
        });

        $.ajax({
            url: data.url,
            type: 'PUT',
            data: file,
            processData: false,
            contentType: file.type,
            xhr: this.progress
        }).done(function (response) {
            this.uiElements.uploadButtonContainer.show();
            this.uiElements.uploadProgressBar.hide();
            setTimeout(function(){
                this.fetchFromDynamoDB();
            }.bind(this), 5000);
        }.bind(this)).fail(function (response) {
            this.uiElements.uploadButtonContainer.show();
            this.uiElements.uploadProgressBar.hide();
            alert('Failed to upload');
        }.bind(this));
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
    },
    addImageToScreen: function (data) {
        // clone the template image element
        var $card = this.uiElements.imageCardTemplate.clone().attr({
            'id': data.image,
        }).show();

        var $img = $card.find('img');
        var $metadata = $card.find('.metadata');
        $img.attr('src', data.image).show();

        var uploadDate = moment(data.createdAt, "x");
        var username = data.user.split("@", 1)[0]; // extract from email
        var metadataText = [uploadDate.fromNow(), "by", username].join(" ");
        $metadata.text(metadataText)

        // show latest images first
        this.uiElements.imageList.append($card);
    },
    fetchFromDynamoDB: function () {
        $.ajax(
            {
                url: this.data.config.apiBaseUrl + '/list',
                type: 'GET',
                processData: false
            }).done(function (unordered, status) {
                this.uiElements.imageList.html("");
                var images = unordered.sort(function(a, b){
                    return parseFloat(b.createdAt, 10) - parseFloat(a.createdAt, 10);
                });
                $.each(images, function(index, image) {
                    this.addImageToScreen(image);
                }.bind(this));
            }.bind(this));
    }
};

import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Chatt2meUploadComp extends LightningElement {
@track dragZoneCss = 'dragAndDrop';
@track fileCSV;
@track fileNameUpload = '';
@track sendFile;
@track sendHeaderCSV;

sendfileupload(event) {
    const sendFileUpload = new CustomEvent('sendfile', { detail : {
        fileName : this.sendFile.fileName,
        value : this.sendFile.value,
        headerCSV : this.sendHeaderCSV
    }});
    this.dispatchEvent(sendFileUpload);
    window.console.log('chamou method');
}

dragEnterHandler(ev) {
    if (this.dragZoneCss.indexOf('isDraging') === -1)
        this.dragZoneCss += ' isDraging';
    ev.preventDefault();
}

dragOverHandler(ev) {
    ev.preventDefault();
}

dragLeaveHandler(ev) {
    this.dragZoneCss = this.dragZoneCss.replace(' isDraging', '');
    ev.preventDefault();
}

async dropHandler(ev) {
    this.dragZoneCss = this.dragZoneCss.replace(' isDraging', '');
    ev.preventDefault();
        let listOfFiles = ev.dataTransfer.files;
        let filesToUpload = [];
        for (let i = 0; i < listOfFiles.length; i++) {
            const result = await this.readFile(listOfFiles[i]);
            filesToUpload.push({
                value: result.data.replace(/^data:.+;base64,/, ""),
                fileName: result.name
            });
            window.console.log(filesToUpload[i].fileName);
            //validation file type is CSV.
            var allowedExtensions = /(\.csv)$/i;
            if (allowedExtensions.exec(filesToUpload[i].fileName)) {
                console.log('o arquivo é valido');
                this.fileNameUpload = filesToUpload[i].fileName;
                if(filesToUpload.length > 0) {
                    this.sendFile = filesToUpload[i];
                    window.console.log(this.sendFile);
                    let headerCSV = atob(this.sendFile.value).split(/\r\n|\n/);
                    console.log(headerCSV[0].split(','));
                    this.sendHeaderCSV = headerCSV[0].split(',');
                    console.log(this.sendHeaderCSV.length);
                }
            }
        }
        this.sendfileupload();   
}

readFile(file) {
    return new Promise(function (resolve, reject) {
        try {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                resolve({
                    name: file.name,
                    data: reader.result
                });
            };
        } catch (ex) {
            reject(ex);
        }
    });
}

onUploadButtonClick() {
    let element = this.template.querySelector("[name='fileUpload']");
    element.click();
}

async onInputUploadHandle(event) {
    window.console.log(event.target.files);

    let element = this.template.querySelector("[name='fileUpload']");
    if (element.files.length > 0) {
        let filesToUpload = [];
        for (let i = 0; i < element.files.length; i++) {
            const result = await this.readFile(element.files[i]);
            window.console.log(result);
            filesToUpload.push({
                value: result.data.replace(/^data:.+;base64,/, ""),
                fileName: result.name
            });
            //validation file type is CSV.
            var allowedExtensions = /(\.csv)$/i;
            if (allowedExtensions.exec(filesToUpload[i].fileName)) {
                console.log('arquivo valido');
                this.fileNameUpload = filesToUpload[i].fileName;
                if(filesToUpload.length > 0) {
                    this.sendFile = filesToUpload[i];
                    window.console.log(this.sendFile.value);
                    let headerCSV = atob(this.sendFile.value).split(/\r\n|\n/);
                    console.log(headerCSV[0].split(','));
                    this.sendHeaderCSV = headerCSV[0].split(',');
                    console.log(this.sendHeaderCSV.length);
                }
            }
        }
        element.value = '';
        this.sendfileupload();
    }
}

createToastEvent(title, message, variant) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(event);
}

uploadFile(filesToUpload) {
    let file = {}
    file.name = filesToUpload[0].fileName;
    file.value = filesToUpload[0].value;
    this.fileCSV = file;
    this.uploaded = true;
    let result = atob(filesToUpload[0].value);
    result = result.replace(/\s+$/, '');
    result = result.replace(/""/g, '\"'); //Remove duplicated double quotes 
    result = window.Papa.parse(result, { header: true, skipEmptyLines: false, delimiter: "," });
    this.hasErrors = false;
    let screenValues = this.hasErrorsInCSV(result);
    if (!this.hasErrors) {
        this.createToastEvent(
            "Success",
            "Your file " + filesToUpload[0].fileName + " was successfully received.",
            "success"
        );
        filesToUpload = [];
    } else {
        this.createToastEvent(
            "Error",
            "There are some errors in your CSV file",
            "error"
        );
    }
    this.lstRowSend = result.data;
    this.lstRow = screenValues;
    this.lstRowLenght = result.data.length;
    this.isnext = this.verifyNext();
}

hasErrorsInCSV(result) {
    let specialCharacters = /[`!@#$%^&*()+\-=\[\]{};:\\|,<>\/?~]/;
    this.lstRowErrors = 0;
    let returnResult = [];
    for (let i = 0; i < result.data.length; i++) {
        let erroLine = i + 1;
        const element = result.data[i];
        if (result.errors[i]) {
            if (result.errors[i].message.includes('Too many fields:')) {
                this.lstRowErrors++;
                returnResult.push({ row: result.errors[i].row +1, error: 'Invalid Columns Count' });
            } else {
                this.lstRowErrors++;
                returnResult.push({ row: result.errors[i].row +1, error: result.errors[i].message });
            }
        } else {
            for (let a = 0; a < Object.keys(element).length; a++) {
                const resultElement = Object.keys(element)[a];
                if (resultElement === '') {
                    this.lstRowErrors++;
                    returnResult.push({ row: erroLine, error: 'Header Column is Empty' });
                } else if (specialCharacters.test(resultElement)) {
                    this.lstRowErrors++;
                    returnResult.push({ row: erroLine, error: 'The field name contains invalid characters' });
                }
            }
        }
    }
    if (this.lstRowErrors !== 0) {
        this.hasErrors = true;
    }
    this.hasErrors = true;
    return returnResult;
}

nextHandlertwo() {
    this.dispatchEvent(new CustomEvent('nexttwo'));
}

}
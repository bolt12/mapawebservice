'use strict'

const File = use('App/Models/File')
const Helpers = use('Helpers')

class FileController {
  async index ( {request, response, params} ) {

    const files = await File.all();

    response.json(files);
  }

  async create () {
  }

  async store({ request, response }) {

    const files = [];

    let { folder } = request.all();
    folder = folder == undefined ? "" : folder;
    folder = "uploaded/" + folder;


    const uploadedFiles = request.file('file', {
      type: ['jpg', 'png', 'jpeg', 'txt', 'pdf', 'mp4', 'mp3', 'flac', 'video', 'image'],
      size: '50mb'
    });

    let file;

    if (uploadedFiles.files !== undefined) {
      await uploadedFiles.moveAll(Helpers.publicPath(folder), (uploadedFile) => {
        return {
          name: `${new Date().getTime()}_${uploadedFile.clientName}`
        }
      });

      if (!uploadedFiles.movedAll()) {
        return uploadedFiles.error()
      }

      uploadedFiles.files.forEach((uploadedFile) => {
        file = new File();
        file.name = uploadedFile.fileName;
        file.path = uploadedFile._location + "/" + uploadedFile.fileName;
        file.folder = folder;
        file.type = uploadedFile.subtype;

        file.save();
        files.push(file);
      })
    }
    else {
      await uploadedFiles.move(Helpers.publicPath(folder), {
        name: `${new Date().getTime()}_${uploadedFiles.clientName}`
      });

      if (!uploadedFiles.moved()) {
        return uploadedFiles.error()
      }

      file = new File();
      file.name = uploadedFiles.fileName;
      file.path = uploadedFiles._location + "/" + uploadedFiles.fileName;
      file.folder = folder;
      file.type = uploadedFiles.subtype;

      file.save();
      files.push(file);

    }

    response.json(files);
  }

  async show ( {request, response, params} ) {

    const id = params.id;

    const file = await File.findOrFail(id);

    response.download(file.path);
  }

  async edit () {
  }

  async update ( {request, response, params} ) {

    const id = params.id;

    const file = await File.findOrFail(id);

    const body = request.except('_method', '_csrf', 'submit');

    file.fill(body);

    await file.save();

    response.json(file);
  }

  async destroy ( {request, response, params} ) {

    const id = params.id;

    const file = await File.findOrFail(id);

    await file.delete();

    response.json(file);
  }

  async fromFolder ({request, response, params} ){

    const folder = "uploaded/" + params.folder;
    const files = await File.query().where('folder', folder).fetch();

    response.json(files);
  }

  async folders ({request, response}) {

    let folders = await File.query().select('folder').fetch();
    folders = folders.rows.map(file => file.folder);
    folders = new Set(folders);

    response.json([...folders]);
  }
}

module.exports = FileController

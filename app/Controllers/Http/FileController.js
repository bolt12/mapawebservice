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

    await uploadedFiles.moveAll(Helpers.publicPath(folder), (uploadedFile) => {
      return {
        name: `${new Date().getTime()}_${uploadedFile.clientName}`
      }
    });

    if (!uploadedFiles.movedAll()) {
      return uploadedFiles.error()
    }

    uploadedFiles.files.forEach( (uploadedFile) => {
      const file = new File();
      file.name = uploadedFile.fileName;
      file.path = uploadedFile._location;
      file.folder = folder;
      file.type = uploadedFile.subtype;

      file.save();
      files.push(file);
    })

    response.json(files);
  }

  async show ( {request, response, params} ) {

    const id = params.id;

    const file = await File.findOrFail(id);

    response.json(file);
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

    const file = File.findOrFail(id);

    await file.delete();

    response.json(file);
  }

  async fromFolder ({request, response, params} ){

    const files = await File.query().where('folder', folder).fetch();

    response.json(files);
  }
}

module.exports = FileController

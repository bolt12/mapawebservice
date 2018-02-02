'use strict'

const Device = use('App/Models/Device')
const File = use('App/Models/File')
const User = use('App/Models/User')
const Job = use('App/Models/Job')
const Helpers = use('Helpers')

class PrinterController {

  async print({ request, response, auth }) {

    /* Node method to create a child process and execute lp command */
    const execSync = require('child_process').execSync;

    /* Gets all the data that comes within the request */
    const body = request.except('_method', '_csrf', 'submit');

    /* Checks if there's any config data within the request, otherwise sets it to " " */
    const config = body.config || " ";

    /* 
    Gets all the data about the printer. 
    If theres no printer with the corresponding data in the database, abort.
    */
    const lprinter_id = body.lprinter_id;
    const lprinter = await Device.findOrFail(lprinter_id);
    if(lprinter.type != 'lprinter'){
      throw new Exceptions.ApplicationException('Device is not a lprinter', 401);
    }

    /* 
    Gets all the data about the use. 
    If theres no user with the corresponding data in the database, abort.
    */
    const user_id = auth.current.user.id;
    const user = await User.findOrFail(user_id);

    const file_id = body.file_id;
    const job = new Job(); // Creates a new Job instance.

    let file = null;

    /* 
    If there's a file id specified within the request data then
    go to the db and fetch all its info.
    Prints the file.
    */
    if (file_id != undefined) {

      file = await File.findOrFail(file_id); // If there's no file abort.

      job.lprinter_id = lprinter.id;
      job.user_id = user_id;
      job.file_id = file_id;

      /* 
      Creates a new process and executes lp command.
      The output is parsed and a new job is saved into the db.
      */
      const stdout = execSync("lp " + config + "-d " + lprinter.name + " " + `${file.path}/${file.name}`).toString();
      console.log(stdout);
      job.id = stdout.split(" ")[3].split('-')[2];

      await job.save(); // Saves job to db

    }
    /* 
    If there's not a file id specified within the request data then
    get the file data from the request itself.
    Prints the file.
    */
    else {

      file = new File(); // New File instance.

      /* Get the file within the request */
      const uploadedFile = request.file('file', {
        type: ['jpg', 'png', 'jpeg', 'txt', 'pdf'],
        size: '50mb'
      });

      /* Moves the uploaded file to a folder with a new name */
      await uploadedFile.move(Helpers.tmpPath('uploads'), {
        name: `${new Date().getTime()}_${uploadedFile.clientName}`
      });

      if (!uploadedFile.moved()) {
        return uploadedFile.error()
      }

      file.name = uploadedFile.fileName;
      file.path = uploadedFile._location;
      file.type = uploadedFile.type;

      await file.save(); // Saves file to db

      job.lprinter_id = lprinter.id;
      job.user_id = user_id;
      job.file_id = file.id;

      /* 
      Creates a new process and executes lp command.
      The output is parsed and a new job is saved into the db.
      */
      const stdout = execSync("lp " + config + "-d " + lprinter.name + " " + `${file.path}/${file.name}`).toString();
      console.log(stdout);
      job.id = stdout.split(" ")[3].split('-')[2];

      await job.save(); // Saves job to db

    }
    /* Sends a response with an object with all the info about the file printed */
    response.json({ job: job, file: file });
  }

}

module.exports = PrinterController

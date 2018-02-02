'use strict'

const Job = use('App/Models/Job')
const Lprinter = use('App/Models/Lprinter')

class JobController {

  async index ( {request, response} ) {

    const jobs = await Job.all();

    response.json(jobs);
  }

  async create () {
  }

  async store () {
  }

  async show ( {request, response, params}) {

    const id = params.id;
    console.log(id);

    const job = await Job.findOrFail(id);

    response.json(job);
  }

  async edit () {
  }

  async update () {
  }

  /* TODO: Add other cancel options */
  async destroy ( {request, response, params} ) {

    const id = params.id;

    const job = await Job.findOrFail(id);
    const lprinter = await Lprinter.findOrFail(job.lprinter_id);

    let execSync = require('child_process').execSync;
    const stdout = execSync("cancel " + lprinter.name + "-" + job.id).toString();
    
    await job.delete();

    response.json(job);
  }
}

module.exports = JobController

'use strict'

const List = use('App/Models/List')
const Task = use('App/Models/Task')

class ListController {
  async index ( {request, response} ) {

    const lists = await List.all();
    const tasks = await Task.all()

    response.json({lists, tasks});
  }

  async store ( {request, response, auth} ) {

    const user_id = auth.current.user.id;
    const body = request.except('_method', '_csrf', 'submit');

    const list = new List();
    list.fill(body);
    list.user_id = user_id;

    await list.save();

    response.json(list);
  }

  async show ( {request, response, params} ) {

    const id = params.id;

    const list = await List.findOrFail(id);
    let tasks = await list.tasks();
    tasks = tasks.filter( task => task.list_id == list.id);

    response.json({ list, tasks });
  }

  async update ( {request, response, params} ) {

    const id = params.id;

    const list = await List.findOrFail(id);

    const body = request.except('_method', '_csrf', 'submit');
    list.fill(body);

    await list.save();

    response.json(list);
  }

  async destroy ( {request, response, params} ) {

    const id = params.id;

    const list = await List.findOrFail(id);

    await list.delete();

    response.json(list);
  }

  async addTask ( {request, response, params} ){

    const id = params.id;
    const body = request.except('_method', '_csrf', 'submit');

    const task = new Task();
    task.fill(body);
    task.list_id = id;

    await task.save();

    response.json(task);
  }

  async editTask ( {request, response, params} ){

    const id = params.id;
    const body = request.except('_method', '_csrf', 'submit');

    const task = await Task.findOrFail(id);
    task.merge(body);

    await task.save();

    response.json(task);
  }
  
  async deleteTask ( {request, response, params} ){

    const id = params.id;

    const task = await Task.findOrFail(id);

    await task.delete();

    response.json(task);
  }
}

module.exports = ListController

import ToDo from './ToDoModel';

export default interface Note {
  title: string;
  todos: Array<ToDo>;
  id: number;
}
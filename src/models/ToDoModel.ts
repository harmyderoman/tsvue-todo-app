export default interface ToDo {
  /** Unique within its note. Missing on todos saved by older versions. */
  id?: number;
  text: string;
  completed: boolean;
}

import TaskTitle from "./TaskTitle";
export const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const List = () => {
  return (
    <div className=" w-full h-full">
      <div  className=" grid grid-cols-3 gap-4 md:gap-x-12 py-4">
        <TaskTitle label="To Do" className={TASK_TYPE.todo} />
        <TaskTitle label="In Progress" className={TASK_TYPE["in progress"]} />
        <TaskTitle label="Completed" className={TASK_TYPE.completed} />
      </div>
    </div>
  );
};

export default List;

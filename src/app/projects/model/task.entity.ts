import { MilestoneId } from '../../shared/model/milestone-id.vo';
import { TaskId } from '../../shared/model/task-id.vo';
import { Specialty } from './specialty.vo';
import { TaskStatus } from './task-status.vo';

export class Task {
  public readonly id: TaskId;
  public name: string;
  public specialty: Specialty;
  public startingDate: Date;
  public dueDate: Date;
  public milestoneId: MilestoneId;
  public status: TaskStatus;
  public description?: string;
  public responsibleId?: string;

  /**
   * Constructs a new Task instance.
   *
   * @param id - Optional ID (default: new UUID).
   * @param name - Task name.
   * @param specialty - Required specialty for the task.
   * @param startingDate - Task starting date.
   * @param dueDate - Task due date.
   * @param milestoneId - ID of the milestone associated with the task.
   * @param status - Task status (default: DRAFT).
   * @param description - Optional description of the task.
   */
  constructor({
    id = new TaskId(),
    name,
    specialty,
    startingDate = new Date(),
    dueDate = new Date(),
    milestoneId,
    status = TaskStatus.DRAFT,
    description = '',
    responsibleId = undefined
  }: {
    id?: TaskId | string;
    name: string;
    specialty: Specialty;
    startingDate?: Date | string;
    dueDate?: Date | string;
    milestoneId: MilestoneId | string;
    status?: TaskStatus;
    description?: string;
    responsibleId?: string;
  }) {
    this.id = id instanceof TaskId ? id : new TaskId(id?.toString());
    this.name = name;
    this.specialty = specialty;
    this.startingDate = startingDate instanceof Date ? startingDate : new Date(startingDate);
    this.dueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
    this.milestoneId = milestoneId instanceof MilestoneId ? milestoneId : new MilestoneId(milestoneId?.toString());
    this.status = status;
    this.description = description;
    this.responsibleId = responsibleId;
  }
}

import { Specialty } from './specialty.vo';
import { TaskStatus } from './task-status.vo';

export class Task {
  public readonly id: number;
  public name: string;
  public specialty: Specialty;
  public startingDate: Date;
  public dueDate: Date;
  public milestoneId: number;
  public status: TaskStatus;
  public description?: string;
  public responsibleId?: number;

  /**
   * Constructs a new Task instance.
   *
   * @param id - Optional ID (default: 0).
   * @param name - Task name.
   * @param specialty - Required specialty for the task.
   * @param startingDate - Task starting date.
   * @param dueDate - Task due date.
   * @param milestoneId - ID of the milestone associated with the task.
   * @param status - Task status (default: DRAFT).
   * @param description - Optional description of the task.
   */
  constructor({
    id = 0,
    name,
    specialty,
    startingDate = new Date(),
    dueDate = new Date(),
    milestoneId,
    status = TaskStatus.DRAFT,
    description = '',
    responsibleId = undefined
  }: {
    id?: number;
    name: string;
    specialty: Specialty;
    startingDate?: Date | string;
    dueDate?: Date | string;
    milestoneId: number;
    status?: TaskStatus;
    description?: string;
    responsibleId?: number;
  }) {
    this.id = id;
    this.name = name;
    this.specialty = specialty;
    this.startingDate = startingDate instanceof Date ? startingDate : new Date(startingDate);
    this.dueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
    this.milestoneId = milestoneId;
    this.status = status;
    this.description = description;
    this.responsibleId = responsibleId !== undefined && typeof responsibleId === 'string' ? Number(responsibleId) : responsibleId;
  }
}

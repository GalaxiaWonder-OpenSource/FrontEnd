import { Specialty } from './specialty.vo';
import { TaskStatus } from './task-status.vo';

export class Task {
  public readonly id: number | undefined;
  public name: string;
  public specialty: Specialty;
  public startingDate: Date;
  public dueDate: Date;
  public milestoneId: number | undefined;
  public status: TaskStatus;
  public description?: string;
  public responsibleId?: number | undefined;

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
    id,
    name,
    specialty,
    startingDate = new Date(),
    dueDate = new Date(),
    milestoneId,
    status = TaskStatus.DRAFT,
    description = '',
    responsibleId,
  }: {
    id?: number;
    name: string;
    specialty: Specialty;
    startingDate?: Date;
    dueDate?: Date;
    milestoneId: number;
    status?: TaskStatus;
    description?: string;
    responsibleId?: number;
  }) {
    this.id = id;
    this.name = name;
    this.specialty = specialty;
    this.startingDate = new Date(startingDate);
    this.dueDate = new Date(dueDate);
    this.milestoneId = milestoneId;
    this.status = status;
    this.description = description;
    this.responsibleId = responsibleId;
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      specialty: this.specialty,
      startingDate: this.startingDate.toISOString(),
      dueDate: this.dueDate.toISOString(),
      milestoneId: this.milestoneId,
      status: this.status,
      description: this.description,
      responsibleId: this.responsibleId,
    };
  }
}

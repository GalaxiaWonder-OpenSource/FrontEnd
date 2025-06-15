import { MilestoneId } from '../../shared/model/milestone-id.vo';
import { ProjectId } from '../../shared/model/project-id.vo';

export class Milestone {
  public readonly id: MilestoneId;
  public name: string;
  public startingDate: Date;
  public endingDate: Date;
  public projectId: ProjectId;
  public description?: string;

  /**
   * Constructs a new Milestone instance.
   *
   * @param id - Optional ID (default: new UUID).
   * @param name - Milestone name.
   * @param startingDate - Milestone starting date.
   * @param endingDate - Milestone ending date.
   * @param projectId - ID of the project associated with the milestone.
   * @param description - Optional description of the milestone.
   */
  constructor({
    id = new MilestoneId(),
    name,
    startingDate = new Date(),
    endingDate = new Date(),
    projectId,
    description = ''
  }: {
    id?: MilestoneId | string;
    name: string;
    startingDate?: Date | string;
    endingDate?: Date | string;
    projectId: ProjectId | string;
    description?: string;
  }) {
    this.id = id instanceof MilestoneId ? id : new MilestoneId(id);
    this.name = name;
    this.startingDate = startingDate instanceof Date ? startingDate : new Date(startingDate);
    this.endingDate = endingDate instanceof Date ? endingDate : new Date(endingDate);
    this.projectId = projectId instanceof ProjectId ? projectId : new ProjectId(projectId?.toString());
    this.description = description;
  }
}

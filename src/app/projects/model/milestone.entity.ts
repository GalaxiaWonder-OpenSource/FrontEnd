export class Milestone {
  public readonly id: number;
  public name: string;
  public startingDate: Date;
  public endingDate: Date;
  public projectId: number; // Internamente se almacena como number
  public description?: string;

  /**
   * Constructs a new Milestone instance.
   *
   * @param id - Optional ID (default: 0).
   * @param name - Milestone name.
   * @param startingDate - Milestone starting date.
   * @param endingDate - Milestone ending date.
   * @param projectId - ID of the project associated with the milestone.
   * @param description - Optional description of the milestone.
   */
  constructor({
    id = 0,
    name,
    startingDate = new Date(),
    endingDate = new Date(),
    projectId,
    description = ''
  }: {
    id?: number;
    name: string;
    startingDate?: Date | string;
    endingDate?: Date | string;
    projectId: string | number;
    description?: string;
  }) {
    this.id = typeof id === 'number' ? id : 0;
    this.name = name;
    this.startingDate = startingDate instanceof Date ? startingDate : new Date(startingDate);
    this.endingDate = endingDate instanceof Date ? endingDate : new Date(endingDate);
    this.projectId = typeof projectId === 'string' ? Number(projectId) : projectId;
    this.description = description;
  }
}

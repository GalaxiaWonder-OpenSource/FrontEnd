export class Milestone {
  public readonly id?: number;
  public name: string;
  public startingDate: Date;
  public endingDate: Date;
  public projectId: number;
  public description?: string;

  /**
   * Constructs a new Milestone instance.
   *
   * @param id - Optional ID of the milestone.
   * @param name - Milestone name.
   * @param startingDate - Starting date (default: now).
   * @param endingDate - Ending date (default: now).
   * @param projectId - Associated project ID.
   * @param description - Optional description.
   */
  constructor({
                id,
                name,
                startingDate = new Date(),
                endingDate = new Date(),
                projectId,
                description = '',
              }: {
    id?: number;
    name: string;
    startingDate?: Date;
    endingDate?: Date;
    projectId: number;
    description?: string;
  }) {
    this.id = id;
    this.name = name;
    this.startingDate = startingDate;
    this.endingDate = endingDate;
    this.projectId = projectId;
    this.description = description;
  }

  /**
   * Converts the milestone to a JSON object compatible with the API.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      startingDate: this.startingDate.toISOString(),
      endingDate: this.endingDate.toISOString(),
      projectId: this.projectId,
      description: this.description,
    };
  }
}

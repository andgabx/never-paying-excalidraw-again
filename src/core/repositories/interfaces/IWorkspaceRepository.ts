import { Workspace } from "../../../types";
export interface IWorkspaceRepository {
  findAll(): Promise<Workspace[]>;
  create(data: { name: string }): Promise<Workspace>;
  update(id: string, data: { name: string }): Promise<Workspace>;
}

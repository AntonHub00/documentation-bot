import IDocumentationData from "../dialogs/shared/IDocumentationData";

export default interface IBotDocumentationBackendService {
  create: (documentation: IDocumentationData) => Promise<void>;
  findById: (id: number) => Promise<IDocumentationData | undefined>;
  findAll: () => Promise<IDocumentationData[] | undefined>;
  findByText: (text: string) => Promise<IDocumentationData[] | undefined>;
  update: (documentation: IDocumentationData) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

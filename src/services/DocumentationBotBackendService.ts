import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import IDocumentationData from "../dialogs/shared/IDocumentationData";
import IBotDocumentationBackendService from "./IBotDocumentationBackendService";

class DocumentationBotBackendService
  implements IBotDocumentationBackendService
{
  private axiosInstance: Axios;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "http://localhost:5000/api/documentation/",
    });
  }

  public async create(documentation: IDocumentationData): Promise<void> {
    await this.axiosInstance.request({
      method: "post",
      data: documentation,
    });
  }

  public async findById(id: number): Promise<IDocumentationData | undefined> {
    let response: AxiosResponse;

    try {
      response = await this.axiosInstance.request({
        method: "get",
        url: `${id}`,
      });
    } catch (error) {
      const e = error as AxiosError;

      if (e.response.status !== 404) throw new Error(error);
    }

    return response.data;
  }

  public async findAll(): Promise<IDocumentationData[] | undefined> {
    let response: AxiosResponse;

    try {
      response = await this.axiosInstance.request({
        method: "get",
      });
    } catch (error) {
      const e = error as AxiosError;

      if (e.response.status !== 404) throw new Error(error);
    }

    return response?.data;
  }

  public async findByText(
    text: string
  ): Promise<IDocumentationData[] | undefined> {
    let response: AxiosResponse;

    try {
      response = await this.axiosInstance.request({
        method: "get",
        data: { text },
      });
    } catch (error) {
      const e = error as AxiosError;

      if (e.response.status !== 404) throw new Error(error);
    }

    return response?.data;
  }

  public async update(documentation: IDocumentationData): Promise<void> {
    await this.axiosInstance.request({
      method: "put",
      url: `${documentation.id}`,
      data: {
        name: documentation.name,
        description: documentation.description,
        link: documentation.link,
      },
    });
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.request({
      method: "delete",
      url: `${id}`,
    });
  }
}

const documentationBotBackendServiceInstance =
  new DocumentationBotBackendService();

export default documentationBotBackendServiceInstance;
export { DocumentationBotBackendService };

import { extend } from "leaflet";
import { PagingRequestModel } from "../common/pagingmodel";
import { UserDetailRequestModel } from "../user/models";



export interface TaskModel {
    id: number;
    name: string;
    priority: number;
    assigneeId: string;
    status: number;
    description: string;
    isArchived: boolean;
    projectId: number;
    statusName: string;
    priorityName: string;
    memberName: string;
    createdOn: string;
    calcTaskId: string;
    user: UserDetailRequestModel;
}
export interface TaskModule {
    id: number;
    name: string;
    priority?: number;
    assigneeId?: string;
    status?: number;
    description: string;
    isArchived?: boolean;
    projectId?: number;
    statusName: string;
    priorityName: string;
    memberName: string;
    checked?: boolean;
    dueDate?: string;
}

export interface ProjectTaskPagingRequestModel extends PagingRequestModel {
    priority: number | 0;
    stringSearch?: string | "";
    projectId?: number | 0;
    taskRequest: number;
    status: number | 0;
}

export interface GetCalculationCountModel {
    total: number;
    perTotal: number;
    inProgress: number;
    perInProgress: number;
    completed: number;
    perCompleted: number;
    archivedPercent: number;
    perMonArchived: number;
    overDuePercent: number;
    perMonOverDue: number;

}



import { Component, OnInit, QueryList, ViewChildren, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbdTaskListSortableHeader, SortEvent } from './task-list-sortable.directive';
import { TaskService } from 'src/app/services/task/project-task.services';
import { PagingResponseModel } from 'src/app/services/common/pagingmodel';
import { EnumValueModel } from 'src/app/services/EnumValue/models';
import { EnumValueService } from 'src/app/services/EnumValue/enumValue.service';
import Swal from 'sweetalert2';
import { ProjectDetailService } from 'src/app/services/project-detail/projectdetail.service';
import { ProjectDetailModel } from 'src/app/services/project-detail/models';
import { GetCalculationCountModel, ProjectTaskPagingRequestModel, TaskModule } from 'src/app/services/task/model';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  providers: [DecimalPipe]
})

export class TaskListComponent implements OnInit {
  @ViewChildren(NgbdTaskListSortableHeader) headers!: QueryList<NgbdTaskListSortableHeader>;
  @Output() projectEvent = new EventEmitter<boolean>();
  ordersForm!: FormGroup;
  breadCrumbItems!: Array<{}>;
  userTaskList!: any;
  priority: EnumValueModel[] = [];
  status: EnumValueModel[] = [];
  userProjects: ProjectDetailModel[] = [];
  taskView!: any
  taskCounts!: GetCalculationCountModel;
  taskForm!: FormGroup;
  taskModelObj!: TaskModule;

  projectId: number = 1;
  taskData: any;
  public Editor = ClassicEditor;
  searchTerm!: string | "";
  checkedList: any;
  totalLength!: number;

  userId: string = '';

  submitted = false;
  masterSelected!: boolean;
  isfirstRender: boolean = false;

  projectSearchRequest: ProjectTaskPagingRequestModel = {
    stringSearch: "",
    pageNumber: 1,
    pageSize: 10,
    projectId: 0,
    priority: 0,
    status: 0,
    taskRequest: 2
  };

  pagingResponse: PagingResponseModel = {
    currentPage: 0,
    totalPages: 0,
    totalCount: 0,
    pageSize: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    startIndex: 0,
    endIndex: 0
  };

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private enumValus: EnumValueService,
    private projectDetailService: ProjectDetailService,
    private taskService: TaskService) {


  }
  ngOnInit(): void {

    this.breadCrumbItems = [
      { label: 'Setting' },
      { label: 'Admin', active: true }
    ];
    this.ordersForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      title: ['', [Validators.required]],
      createName: ['', [Validators.required]],
      status: ['', [Validators.required]],
      priority: ['', [Validators.required]]
    });

    /**
     * fetches data
     */
    this.fetchData(true);
    this.Fromgroup();
    this.getAllPriorityList();
    this.getAllStatusList();
    this.currentUserProjects();
  }

  fetchData(value : boolean) {
    this.currentUserTasks();
    this.getCalculationCount(value);
  }

  /**
   * proprties of formgroup
   */
  Fromgroup() {
    this.taskForm = this.formBuilder.group({
      id: [0],
      name: ['', [Validators.required]],
      priority: [0, [Validators.required]],
      assigneeId: ['', [Validators.required]],
      status: [1, [Validators.required]],
      description: ['', [Validators.required]],
      isArchived: [false],
      projectId: [0],
      statusName: [''],
      priorityName: [''],
      memberName: [''],
      fullName: [''],
      dueDate: ['']
    });
  }

  /**
   * current user all tasks
   */
  currentUserTasks() {
    this.taskService.getAll(this.projectSearchRequest).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userTaskList = res.data;
          this.userTaskList = this.userTaskList.map((x: any) => {
            x.priorityName = this.priority.filter(y => x.priority == y.value)[0]?.displayName;
            x.statusName = this.status.filter(y => x.status == y.value)[0]?.displayName;
            return x;
          });
          this.totalLength = this.userTaskList.length;
          this.pagingResponse = res;
        } else {
          this.userTaskList = [];
          this.totalLength = 0;
        }
      },
      error: (err: any) => { },
      complete: () => { }
    })
  }

  /**
   * Task Counts
   */
  getCalculationCount(value : boolean) {
    this.taskService.getTaskCalcCount().subscribe({
      next: (res: any) => {  
        this.isfirstRender =  value;
        if (res && res.data)
          this.taskCounts = res?.data;              
      },      
      error: (err: any) => { }
    })
  }

  checkTaskCount(taskCount: any) {
    return taskCount < 0;
  }

  /**
   * current user all project 
   */
  currentUserProjects() {
    this.projectDetailService.getCurrentUserProjects().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userProjects = res.data;
        }
      },
      error: (error: any) => { }
    })
  }

  /**
   * reset filters
   */
  resetFilters() {
    this.projectSearchRequest = {
      stringSearch: "",
      pageNumber: 1,
      pageSize: 10,
      projectId: 0,
      priority: 0,
      status: 0,
      taskRequest: 2//task list
    };
    this.modalService.dismissAll();
    this.fetchData(false);
  }

  /*
  * get all priority list
  */
  getAllPriorityList() {
    this.enumValus.getPriorities().subscribe(res => {
      this.priority = res;
    })
  }

  /*
  * get all status list
  */
  getAllStatusList() {
    this.enumValus.getTaskStatus().subscribe(res => {
      this.status = res;
    })
  }

  onEventOccur(event: any) {
    this.projectSearchRequest.pageNumber = event;
    this.currentUserTasks();
  }

  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /*
 * Refillin data in the model
 */
  openEditModal(edit: any, row: any) {
    this.taskForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
    this.modalService.open(edit, { size: 'md', centered: true, windowClass: 'customModal' });

    let data = [];
    data.push(row);
    data.push({ fullName: `${row.user.firstName} ${row.user.lastName}` });
    data.push({ dueDate: row.dueDate ? new Date(row.dueDate) : null });

    data.forEach(x => {
      this.taskForm.patchValue(x);
      this.taskView = x;
    });

  }

  openViewModal(view: any, row: any) {
    this.modalService.dismissAll();
    this.modalService.open(view, { size: 'md', windowClass: 'customModal' });
    this.taskView = row;
  }

  get form() {
    return this.ordersForm.controls;
  }
  /**
   * on click mark as complete 
   * show confirmation model
   * @param task 
   */
  markAsComplete(task: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to complete this task!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete it!',
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {

      if (result.isConfirmed) {
        this.completeTask(task);
      }
    });
  }

  /**
   * complete
   * @param task 
   */
  completeTask(task: any) {
    if (task) {
      task.status = 3;
      this.taskService.createOrUpdate(task).subscribe({
        next: (res: any) => {
          Swal.fire(
            'Completed!',
            'Your Task is Completed.',
            'success'
          );
          this.fetchData(false);
        },
        error: (err: any) => { }
      })
    }
  }

  /**
   * view profile 
   * @param profile 
   * @param user 
   */
  viewprofile(profile: any, user: any) {
    if (user) {
      this.submitted = false;
      this.userId = user.id;
      this.modalService.open(profile, { size: 'sm', centered: true });
    }
  }

  UpdateData() {
    if (this.taskForm.valid) {
      this.taskModelObj = this.taskForm.getRawValue();
      this.taskModelObj.projectId = this.projectId;
      this.taskModelObj.isArchived = false;
      this.taskService.createOrUpdate(this.taskModelObj ?? null).subscribe({
        next: (res: any) => {
          this.taskForm.reset();
          this.modalService.dismissAll();
          this.fetchData(false);
        },
        error: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
          })
        },
        complete: () => {
          this.submitted = false;
          Swal.fire({
            title: 'Success',
            text: 'Task is updated Successfully',
            icon: 'success',
            confirmButtonColor: '#45CB85',
          })
        }
      })
    }
    else {
      this.submitted = true;
      return
    }
  }

  

}



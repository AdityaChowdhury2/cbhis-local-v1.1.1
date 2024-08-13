import { Component, OnInit } from '@angular/core';
import { of, switchMap } from 'rxjs';

import { UserAccount } from 'src/app/modules/auth/models/user';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { CreateUserWizardComponent } from '../../components/create-user-wizard/create-user-wizard.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: UserAccount[] = [];
  constructor(private modalService: ModalService, private userStorageService: UserStorageService) {}

  ngOnInit() {
    try {
      this.userStorageService
        .userState()
        .pipe(
          switchMap((res) => {
            if (res) {
              return this.userStorageService.fetchUsers();
            } else {
              return of([]);
            }
          })
        )
        .subscribe((users) => {
          this.users = users;
        });
    } catch (error) {}
  }

  async openModal() {
    this.modalService.presentModal({ component: CreateUserWizardComponent });
  }

  onRowClick(index: number) {
    // this.users[index].checked = !this.users[index].checked;
    console.log('Row clicked', this.users[index]);
  }

  editUser(user: any, event: Event) {
    event.stopPropagation();
    // Handle the edit user action here
  }
}
